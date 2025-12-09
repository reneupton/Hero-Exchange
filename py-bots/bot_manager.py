import asyncio
import logging
import time
from typing import List, Optional

import httpx

from config import Settings
from bot import AuctionBot


class BotManager:
    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or Settings()
        self.client: Optional[httpx.AsyncClient] = None
        self.bots: List[AuctionBot] = []
        self.tasks: List[asyncio.Task] = []
        self.running = False
        self._activity: List[dict] = []
        self._activity_limit: int = 200
        # Visitor-aware mode
        self._visitor_aware = True
        self._idle_timeout_sec = 300  # Stop bots after 5 minutes of no visitors
        self._poll_interval_sec = 90  # Check presence every 90 seconds (reduced from 30s)
        self._last_visitor_time: float = 0
        self._presence_task: Optional[asyncio.Task] = None
        # Anti-thrash: limit bot starts to max 4 per hour
        self._max_starts_per_hour = 4
        self._start_times: List[float] = []

    def _log_activity(self, bot: str, event: str, data: dict):
        entry = {"ts": time.time(), "bot": bot, "event": event, "data": data}
        self._activity.append(entry)
        if len(self._activity) > self._activity_limit:
            self._activity = self._activity[-self._activity_limit :]

    def get_activity(self) -> List[dict]:
        return list(reversed(self._activity))

    async def _check_presence(self) -> int:
        """Check the presence endpoint for active visitor count."""
        try:
            # Use the gateway URL to access the presence endpoint
            presence_url = str(self.settings.api_base).rstrip("/") + "/presence"
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(presence_url)
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("connections", 0)
        except Exception as e:
            logging.warning(f"Failed to check presence: {e}")
        return 0

    async def _presence_loop(self):
        """Background task that monitors visitor presence and starts/stops bots accordingly."""
        logging.info("Visitor-aware mode enabled - monitoring presence")
        while True:
            try:
                connections = await self._check_presence()

                if connections > 0:
                    self._last_visitor_time = time.time()
                    if not self.running:
                        # Check hourly start cap to avoid thrashing
                        now = time.time()
                        hour_ago = now - 3600
                        self._start_times = [t for t in self._start_times if t > hour_ago]
                        if len(self._start_times) >= self._max_starts_per_hour:
                            logging.warning(f"Start cap reached ({self._max_starts_per_hour}/hr), waiting")
                            self._log_activity("system", "start_cap_reached", {"starts_this_hour": len(self._start_times)})
                        else:
                            logging.info(f"Visitors detected ({connections}), starting bots")
                            self._log_activity("system", "visitors_detected", {"connections": connections})
                            self._start_times.append(now)
                            await self._start_bots()
                else:
                    # Check if we've been idle too long
                    if self.running and self._last_visitor_time > 0:
                        idle_time = time.time() - self._last_visitor_time
                        if idle_time > self._idle_timeout_sec:
                            logging.info(f"No visitors for {idle_time:.0f}s, stopping bots")
                            self._log_activity("system", "idle_timeout", {"idle_seconds": idle_time})
                            await self._stop_bots()
            except Exception as e:
                logging.error(f"Error in presence loop: {e}")

            await asyncio.sleep(self._poll_interval_sec)

    async def _start_bots(self):
        """Start bot loops without affecting presence monitoring."""
        if self.running:
            return
        self.running = True
        self.client = httpx.AsyncClient(timeout=10)
        users = [u.strip() for u in self.settings.bot_users.split(",") if u.strip()]
        self.bots = [
            AuctionBot(u, self.settings.bot_password, self.settings, self.client, log_fn=self._log_activity)
            for u in users
        ]

        async def loop_bot(bot: AuctionBot):
            while self.running:
                try:
                    await bot.tick()
                except Exception as exc:
                    bot.stats.failures += 1
                    bot.stats.last_error = str(exc)
                await asyncio.sleep(1)

        self.tasks = [asyncio.create_task(loop_bot(b)) for b in self.bots]

    async def _stop_bots(self):
        """Stop bot loops without affecting presence monitoring."""
        self.running = False
        for t in self.tasks:
            t.cancel()
        self.tasks = []
        self.bots = []
        if self.client:
            await self.client.aclose()
            self.client = None

    async def start(self):
        """Start the bot manager. In visitor-aware mode, starts presence monitoring instead of bots directly."""
        if self._visitor_aware:
            if self._presence_task is None:
                self._presence_task = asyncio.create_task(self._presence_loop())
                self._log_activity("system", "presence_monitor_started", {})
        else:
            await self._start_bots()

    async def stop(self):
        """Stop all bots and presence monitoring."""
        if self._presence_task:
            self._presence_task.cancel()
            self._presence_task = None
        await self._stop_bots()

    async def apply_config(self, updates: dict):
        # Handle visitor-aware settings
        if "visitor_aware" in updates:
            self._visitor_aware = bool(updates.pop("visitor_aware"))
        if "idle_timeout_sec" in updates:
            self._idle_timeout_sec = int(updates.pop("idle_timeout_sec"))
        if "poll_interval_sec" in updates:
            self._poll_interval_sec = int(updates.pop("poll_interval_sec"))
        if "max_starts_per_hour" in updates:
            self._max_starts_per_hour = int(updates.pop("max_starts_per_hour"))

        # Restart with new config
        await self.stop()
        for key, value in updates.items():
            if hasattr(self.settings, key):
                setattr(self.settings, key, value)
        await self.start()

    def config_snapshot(self):
        return {
            "api_base": self.settings.api_base,
            "identity_url": self.settings.identity_url,
            "bot_users": self.settings.bot_users,
            "bot_password": self.settings.bot_password,
            "bid_rate_per_min": self.settings.bid_rate_per_min,
            "create_rate_per_min": self.settings.create_rate_per_min,
            "mystery_interval_min": self.settings.mystery_interval_min,
            "daily_interval_hours": self.settings.daily_interval_hours,
            "max_bids_per_auction": self.settings.max_bids_per_auction,
            "max_active_auctions_per_bot": self.settings.max_active_auctions_per_bot,
            "min_balance": self.settings.min_balance,
            "auto_topup": self.settings.auto_topup,
            # Visitor-aware settings
            "visitor_aware": self._visitor_aware,
            "idle_timeout_sec": self._idle_timeout_sec,
            "poll_interval_sec": self._poll_interval_sec,
            "max_starts_per_hour": self._max_starts_per_hour,
        }

    def status(self):
        return [
            {
                "name": b.username,
                "running": self.running,
                "bids": b.stats.bids_placed,
                "auctions": b.stats.auctions_created,
                "mysteries": b.stats.mysteries_opened,
                "failures": b.stats.failures,
                "lastError": b.stats.last_error,
            }
            for b in self.bots
        ]
