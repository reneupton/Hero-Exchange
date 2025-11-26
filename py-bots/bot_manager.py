import asyncio
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

    def _log_activity(self, bot: str, event: str, data: dict):
        entry = {"ts": time.time(), "bot": bot, "event": event, "data": data}
        self._activity.append(entry)
        if len(self._activity) > self._activity_limit:
            self._activity = self._activity[-self._activity_limit :]

    def get_activity(self) -> List[dict]:
        return list(reversed(self._activity))

    async def start(self):
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

    async def stop(self):
        self.running = False
        for t in self.tasks:
            t.cancel()
        self.tasks = []
        self.bots = []
        if self.client:
            await self.client.aclose()
            self.client = None

    async def apply_config(self, updates: dict):
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
