"""Core bot logic: creates listings, places bids, and opens mystery boxes to simulate marketplace activity."""
import asyncio
import random
import time
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_fixed

from config import Settings

# Hero archetypes - rarity is applied dynamically with weighted random selection
HERO_ARCHETYPES = [
    {
        "id": "veyla",
        "title": "Veyla the Shadow Lich",
        "brand": "Necromancer",
        "base_stats": {"str": 42, "int": 95, "vit": 68, "agi": 54},
        "condition": "Hero",
        "colorway": "Arcane",
        "releaseYear": 2025,
        "specs": "Master of shadow flames and soul drain.",
        "imageUrl": "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png",
    },
    {
        "id": "elyra",
        "title": "Elyra Nocturne",
        "brand": "Oracle",
        "base_stats": {"str": 34, "int": 88, "vit": 60, "agi": 58},
        "condition": "Hero",
        "colorway": "Umbral",
        "releaseYear": 2025,
        "specs": "Seer of eclipses, whispers prophecies.",
        "imageUrl": "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png",
    },
    {
        "id": "morr",
        "title": "Morr Wispblade",
        "brand": "Reaper",
        "base_stats": {"str": 68, "int": 64, "vit": 58, "agi": 72},
        "condition": "Hero",
        "colorway": "Wraith",
        "releaseYear": 2025,
        "specs": "Edge of dusk; silent executioner.",
        "imageUrl": "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png",
    },
    {
        "id": "sigrun",
        "title": "Sigrun Dawnbreak",
        "brand": "Valkyrie",
        "base_stats": {"str": 90, "int": 48, "vit": 82, "agi": 70},
        "condition": "Hero",
        "colorway": "Sunsteel",
        "releaseYear": 2025,
        "specs": "Skyrider who guards fallen champions.",
        "imageUrl": "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png",
    },
    {
        "id": "caelys",
        "title": "Caelys Ember-Crusader",
        "brand": "Warrior",
        "base_stats": {"str": 82, "int": 32, "vit": 78, "agi": 52},
        "condition": "Hero",
        "colorway": "Emberbone",
        "releaseYear": 2025,
        "specs": "Frontline bastion wielding holy fire.",
        "imageUrl": "/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png",
    },
    {
        "id": "torhild",
        "title": "Torhild Embercore",
        "brand": "Guardian",
        "base_stats": {"str": 88, "int": 28, "vit": 92, "agi": 28},
        "condition": "Hero",
        "colorway": "Magma",
        "releaseYear": 2025,
        "specs": "Living bulwark of stone and flame.",
        "imageUrl": "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png",
    },
    {
        "id": "frostech",
        "title": "Frostech Ward",
        "brand": "Guardian",
        "base_stats": {"str": 74, "int": 35, "vit": 86, "agi": 32},
        "condition": "Hero",
        "colorway": "Frost",
        "releaseYear": 2025,
        "specs": "Icebound sentinel, anchors the line.",
        "imageUrl": "/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png",
    },
    {
        "id": "grum",
        "title": "Grum Ironhorn",
        "brand": "Berserker",
        "base_stats": {"str": 96, "int": 18, "vit": 88, "agi": 44},
        "condition": "Hero",
        "colorway": "Bronze",
        "releaseYear": 2025,
        "specs": "Stampeding minotaur, unstoppable charge.",
        "imageUrl": "/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png",
    },
    {
        "id": "astrael",
        "title": "Astrael Fallen",
        "brand": "Reaper",
        "base_stats": {"str": 76, "int": 74, "vit": 72, "agi": 66},
        "condition": "Hero",
        "colorway": "Celestial",
        "releaseYear": 2025,
        "specs": "Winged revenant with twilight scythe.",
        "imageUrl": "/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angel_1/card/frame_0.png",
    },
    {
        "id": "dresh",
        "title": "Dresh Wildarrow",
        "brand": "Ranger",
        "base_stats": {"str": 58, "int": 24, "vit": 52, "agi": 68},
        "condition": "Hero",
        "colorway": "Verdant",
        "releaseYear": 2025,
        "specs": "Quickdraw hunter of the wild clans.",
        "imageUrl": "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png",
    },
]

# Rarity weights matching the backend (Common: 65%, Rare: 22%, Epic: 10%, Legendary: 3%)
RARITY_WEIGHTS = [
    ("Common", 65),
    ("Rare", 22),
    ("Epic", 10),
    ("Legendary", 3),
]

# Stat multipliers by rarity
RARITY_SCALE = {
    "Common": 0.7,
    "Rare": 1.0,
    "Epic": 1.25,
    "Legendary": 1.5,
}


def pick_weighted_rarity() -> str:
    """Pick a rarity using weighted random selection."""
    total = sum(w for _, w in RARITY_WEIGHTS)
    roll = random.randint(1, total)
    cumulative = 0
    for rarity, weight in RARITY_WEIGHTS:
        cumulative += weight
        if roll <= cumulative:
            return rarity
    return "Common"


def create_hero_listing(archetype: dict, rarity: str) -> dict:
    """Create a hero listing with stats scaled by rarity."""
    scale = RARITY_SCALE.get(rarity, 1.0)
    stats = archetype["base_stats"]
    scaled_stats = {k: int(round(v * scale)) for k, v in stats.items()}
    variant_str = f"STR {scaled_stats['str']} | INT {scaled_stats['int']} | VIT {scaled_stats['vit']} | AGI {scaled_stats['agi']}"

    return {
        "title": archetype["title"],
        "brand": archetype["brand"],
        "category": rarity,
        "variant": variant_str,
        "condition": archetype["condition"],
        "colorway": archetype["colorway"],
        "releaseYear": archetype["releaseYear"],
        "specs": archetype["specs"],
        "imageUrl": archetype["imageUrl"],
    }


@dataclass
class BotStats:
    bids_placed: int = 0
    auctions_created: int = 0
    mysteries_opened: int = 0
    failures: int = 0
    last_error: Optional[str] = None


class AuctionBot:
    def __init__(
        self,
        username: str,
        password: str,
        settings: Settings,
        client: httpx.AsyncClient,
        log_fn: Optional[Callable[[str, str, Dict], None]] = None,
    ):
        self.username = username
        self.password = password
        self.settings = settings
        self.client = client
        self.log_fn = log_fn
        self.token: Optional[str] = None
        self.token_expires_at: float = 0
        self.stats = BotStats()
        self.last_daily: float = 0
        self.last_mystery: float = 0
        self.active_auctions: List[str] = []

    async def login(self):
        token_url = (self.settings.identity_url or self.settings.api_base).rstrip("/") + "/connect/token"
        data = {
            "grant_type": "password",
            "client_id": "pybot",
            "client_secret": "NotASecret",
            "username": self.username,
            "password": self.password,
            "scope": "openid profile auctionApp",
        }
        resp = await self.client.post(token_url, data=data)
        resp.raise_for_status()
        payload = resp.json()
        self.token = payload.get("access_token")
        expires_in = payload.get("expires_in", 3600)
        self.token_expires_at = time.time() + expires_in - 60  # refresh 1 minute early

    def auth_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    async def ensure_token(self):
        if not self.token or time.time() > self.token_expires_at:
            await self.login()

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    async def fetch_profile(self) -> Optional[Dict]:
        await self.ensure_token()
        resp = await self.client.get(self.settings.api_base + "progress/me", headers=self.auth_headers())
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.get(self.settings.api_base + "progress/me", headers=self.auth_headers())
        resp.raise_for_status()
        return resp.json()

    async def top_up_if_needed(self):
        if not self.settings.auto_topup:
            return
        profile = await self.fetch_profile()
        if not profile:
            return
        balance = profile.get("flogBalance", 0)
        if balance < self.settings.min_balance:
            delta = self.settings.min_balance - balance
            await self.award("admin-topup", delta)
            if self.log_fn:
                self.log_fn(self.username, "topup", {"delta": delta})

    async def award(self, action: str, amount: Optional[int] = None):
        payload = {"action": action}
        if amount:
            payload["amount"] = amount
        resp = await self.client.post(
            self.settings.api_base + "progress/award", json=payload, headers=self.auth_headers()
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                self.settings.api_base + "progress/award", json=payload, headers=self.auth_headers()
            )
        if resp.is_success:
            return resp.json()
        else:
            self.stats.failures += 1
            self.stats.last_error = resp.text
            return None

    async def open_mystery(self):
        now = time.time()
        if now - self.last_mystery < self.settings.mystery_interval_min * 60:
            return
        resp = await self.client.post(
            self.settings.api_base + "progress/mystery", json={}, headers=self.auth_headers()
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                self.settings.api_base + "progress/mystery", json={}, headers=self.auth_headers()
            )
        if resp.is_success:
            self.last_mystery = now
            self.stats.mysteries_opened += 1
            if self.log_fn:
                self.log_fn(self.username, "mystery", {})

    async def list_live_auctions(self) -> List[Dict]:
        resp = await self.client.get(
            self.settings.api_base + "auctions?filter=live&pageSize=10", headers=self.auth_headers()
        )
        resp.raise_for_status()
        data = resp.json()
        # API returns list directly or {results: [...]} depending on endpoint
        if isinstance(data, list):
            return data
        return data.get("results", [])

    async def create_auction(self):
        if len(self.active_auctions) >= self.settings.max_active_auctions_per_bot:
            return
        archetype = random.choice(HERO_ARCHETYPES)
        rarity = pick_weighted_rarity()
        item = create_hero_listing(archetype, rarity)
        end_date = time.time() + 3600 * 24  # 24h from now
        payload = {
            **item,
            "reservePrice": random.randint(300, 1500),
            "auctionEnd": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(end_date)),
        }
        resp = await self.client.post(
            self.settings.api_base + "auctions", json=payload, headers=self.auth_headers()
        )
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(
                self.settings.api_base + "auctions", json=payload, headers=self.auth_headers()
            )
        if resp.is_success:
            auction = resp.json()
            if isinstance(auction, dict) and auction.get("id"):
                self.active_auctions.append(auction["id"])
                self.stats.auctions_created += 1
                if self.log_fn:
                    self.log_fn(
                        self.username,
                        "create-auction",
                        {"id": auction["id"], "title": item["title"]},
                    )

    async def place_bid(self, auction: Dict):
        auction_id = auction.get("id")
        status = (auction.get("status") or "").lower()
        if status and status not in {"active", "live"}:
            # Avoid errors when the auction has already ended or is not active
            return
        current = auction.get("currentHighBid", 0)
        next_bid = current + random.randint(5, 25)
        # API expects query params: POST /api/bids?auctionId={id}&amount={amount}
        url = f"{self.settings.api_base}bids?auctionId={auction_id}&amount={next_bid}"
        resp = await self.client.post(url, headers=self.auth_headers())
        if resp.status_code == 401:
            await self.login()
            resp = await self.client.post(url, headers=self.auth_headers())
        if resp.is_success:
            self.stats.bids_placed += 1
            if self.log_fn:
                self.log_fn(self.username, "bid", {"auctionId": auction_id, "amount": next_bid})
        else:
            message = (resp.text or "").lower()
            if "auction ended" in message or "ended" in message:
                # Treat ended auctions as benign to avoid noisy errors
                return
            self.stats.failures += 1
            self.stats.last_error = resp.text

    async def tick(self):
        await self.ensure_token()

        await self.top_up_if_needed()

        if time.time() - self.last_daily > self.settings.daily_interval_hours * 3600:
            await self.award("daily-login")
            self.last_daily = time.time()

        await self.open_mystery()

        if random.random() < (self.settings.create_rate_per_min / 60):
            await self.create_auction()

        if random.random() < (self.settings.bid_rate_per_min / 60):
            auctions = await self.list_live_auctions()
            # Filter to only hero items (condition == "Hero")
            hero_auctions = [a for a in auctions if a.get("condition") == "Hero"]
            random.shuffle(hero_auctions)
            # Place only 1 bid per trigger
            for a in hero_auctions:
                if a.get("seller") == self.username:
                    continue
                await self.place_bid(a)
                break  # Only bid on one auction per tick


async def run_bots(settings: Settings):
    users = [u.strip() for u in settings.bot_users.split(",") if u.strip()]
    async with httpx.AsyncClient(timeout=10) as client:
        bots = [AuctionBot(u, settings.bot_password, settings, client) for u in users]

        async def loop_bot(bot: AuctionBot):
            while True:
                try:
                    await bot.tick()
                except Exception as exc:
                    bot.stats.failures += 1
                    bot.stats.last_error = str(exc)
                await asyncio.sleep(1)

        await asyncio.gather(*(loop_bot(bot) for bot in bots))


if __name__ == "__main__":
    settings = Settings()
    asyncio.run(run_bots(settings))
