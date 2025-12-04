"""Quick script to seed the database with hero auctions."""
import asyncio
import random
import time
import httpx

API_BASE = "http://localhost:6001/"
IDENTITY_URL = "http://localhost:5000/"
BOT_USERS = ["alice", "bob"]
BOT_PASSWORD = "Pass123$"

HEROES = [
    {
        "title": "Veyla the Shadow Lich",
        "brand": "Necromancer",
        "category": "Legendary",
        "variant": "INT 95 | STR 42 | VIT 68 | AGI 54",
        "condition": "Hero",
        "colorway": "Arcane",
        "releaseYear": 2025,
        "specs": "Master of shadow flames and soul drain.",
        "imageUrl": "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png",
    },
    {
        "title": "Elyra Nocturne",
        "brand": "Oracle",
        "category": "Epic",
        "variant": "INT 88 | STR 34 | VIT 60 | AGI 58",
        "condition": "Hero",
        "colorway": "Umbral",
        "releaseYear": 2025,
        "specs": "Seer of eclipses, whispers prophecies.",
        "imageUrl": "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png",
    },
    {
        "title": "Morr Wispblade",
        "brand": "Reaper",
        "category": "Rare",
        "variant": "STR 68 | INT 64 | VIT 58 | AGI 72",
        "condition": "Hero",
        "colorway": "Wraith",
        "releaseYear": 2025,
        "specs": "Edge of dusk; silent executioner.",
        "imageUrl": "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png",
    },
    {
        "title": "Sigrun Dawnbreak",
        "brand": "Valkyrie",
        "category": "Legendary",
        "variant": "STR 90 | VIT 82 | AGI 70 | INT 48",
        "condition": "Hero",
        "colorway": "Sunsteel",
        "releaseYear": 2025,
        "specs": "Skyrider who guards fallen champions.",
        "imageUrl": "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png",
    },
    {
        "title": "Dresh Wildarrow",
        "brand": "Ranger",
        "category": "Common",
        "variant": "STR 58 | AGI 68 | VIT 52 | INT 24",
        "condition": "Hero",
        "colorway": "Verdant",
        "releaseYear": 2025,
        "specs": "Quickdraw hunter of the wild clans.",
        "imageUrl": "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png",
    },
    {
        "title": "Kira Frostweaver",
        "brand": "Mage",
        "category": "Epic",
        "variant": "INT 85 | STR 30 | VIT 55 | AGI 65",
        "condition": "Hero",
        "colorway": "Glacial",
        "releaseYear": 2025,
        "specs": "Ice sorceress who commands winter storms.",
        "imageUrl": "/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png",
    },
    {
        "title": "Throk Ironforge",
        "brand": "Warrior",
        "category": "Rare",
        "variant": "STR 82 | VIT 78 | AGI 45 | INT 30",
        "condition": "Hero",
        "colorway": "Steel",
        "releaseYear": 2025,
        "specs": "Battle-hardened defender of the realm.",
        "imageUrl": "/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png",
    },
    {
        "title": "Luna Shadowstep",
        "brand": "Assassin",
        "category": "Epic",
        "variant": "AGI 92 | STR 55 | VIT 48 | INT 40",
        "condition": "Hero",
        "colorway": "Midnight",
        "releaseYear": 2025,
        "specs": "Silent blade that strikes from darkness.",
        "imageUrl": "/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png",
    },
    {
        "title": "Grom Earthshaker",
        "brand": "Warrior",
        "category": "Common",
        "variant": "STR 70 | VIT 72 | AGI 35 | INT 22",
        "condition": "Hero",
        "colorway": "Stone",
        "releaseYear": 2025,
        "specs": "Mountain giant with unstoppable force.",
        "imageUrl": "/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png",
    },
    {
        "title": "Aria Lightbringer",
        "brand": "Paladin",
        "category": "Legendary",
        "variant": "STR 78 | VIT 85 | INT 60 | AGI 52",
        "condition": "Hero",
        "colorway": "Divine",
        "releaseYear": 2025,
        "specs": "Holy warrior blessed by the gods.",
        "imageUrl": "/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png",
    },
]


async def get_token(client: httpx.AsyncClient, username: str, password: str) -> str:
    """Get access token for a user."""
    token_url = IDENTITY_URL + "connect/token"
    data = {
        "grant_type": "password",
        "client_id": "pybot",
        "client_secret": "NotASecret",
        "username": username,
        "password": password,
        "scope": "openid profile auctionApp",
    }
    resp = await client.post(token_url, data=data)
    resp.raise_for_status()
    return resp.json()["access_token"]


async def create_auction(client: httpx.AsyncClient, token: str, hero: dict) -> dict:
    """Create an auction for a hero."""
    end_date = time.time() + 3600 * random.randint(12, 72)  # 12-72 hours from now
    payload = {
        **hero,
        "reservePrice": random.randint(100, 2000),
        "auctionEnd": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(end_date)),
    }
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.post(API_BASE + "auctions", json=payload, headers=headers)
    resp.raise_for_status()
    return resp.json()


async def main():
    print("Starting database seed...")

    async with httpx.AsyncClient(timeout=30) as client:
        # Get tokens for both users
        tokens = {}
        for user in BOT_USERS:
            try:
                tokens[user] = await get_token(client, user, BOT_PASSWORD)
                print(f"[OK] Got token for {user}")
            except Exception as e:
                print(f"[FAIL] Failed to get token for {user}: {e}")
                return

        # Create auctions - distribute among users
        created = 0
        for i, hero in enumerate(HEROES):
            user = BOT_USERS[i % len(BOT_USERS)]
            token = tokens[user]
            try:
                result = await create_auction(client, token, hero)
                print(f"[OK] Created auction for '{hero['title']}' by {user} (ID: {result.get('id', 'unknown')})")
                created += 1
            except Exception as e:
                print(f"[FAIL] Failed to create auction for '{hero['title']}': {e}")

        print(f"\nDone! Created {created} auctions.")


if __name__ == "__main__":
    asyncio.run(main())
