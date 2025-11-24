import asyncio
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

    async def start(self):
        if self.running:
            return
        self.running = True
        self.client = httpx.AsyncClient(timeout=10)
        users = [u.strip() for u in self.settings.bot_users.split(",") if u.strip()]
        self.bots = [AuctionBot(u, self.settings.bot_password, self.settings, self.client) for u in users]

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
