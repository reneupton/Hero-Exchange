# Hero Exchange

Dark-fantasy hero marketplace built as a portfolio-grade microservices demo. Collect heroes, run live auctions, get daily mystery pulls, and watch real-time bids roll in. Everything runs on a modern stack (Next.js + .NET microservices + SignalR + RabbitMQ) with working auth and search.

## Why it’s interesting
- End-to-end flow: Identity → Gateway → Auctions/Bidding/Search/Notifications → Next.js UI.
- Real-time UX: SignalR updates for bids/notifications; animated hero cards and daily summon box.
- Demo-friendly: Seeded users, guest login, bots to keep the marketplace lively.

## Tech Stack (with reasons)
- Frontend: Next.js 13 (App Router), React 18, TypeScript, TailwindCSS – fast DX, server actions, and component-level tests with Jest/RTL.
- Admin: Angular (separate admin console) – showcases multi-frontend setup.
- Backend: .NET 8 microservices (Gateway, Identity with Duende, Auction, Bidding, Search, Notification) – clear service boundaries and strong tooling.
- Messaging/Real-time: RabbitMQ for events, SignalR for live bid/notification streams.
- Data: PostgreSQL (auctions/users), MongoDB (search index), Redis not required.
- Infra: Docker, Railway/Vercel for hosting; YARP gateway for routing.

## Features
- Hero auctions: create, bid, reserve-price handling, status changes.
- Progression: gold wallet, hero power, achievements, daily login, 24h mystery box.
- Hero inventory: animated sprites, stats, lore, rarity colors.
- Search & filters: text search, sort, status filters, seller/winner filters.
- Admin: adjust balances/XP, manage auctions, reindex search.
- Bots: Python bot service to simulate listings/bids.

## Getting Started (local)
Prereqs: .NET 8 SDK, Node.js 18+, Docker Desktop, Python 3.11+ (for bots).

```bash
git clone https://github.com/reneupton/Hero-Exchange.git
cd Hero-Exchange
docker-compose up -d postgres mongodb rabbitmq
# Backends (each in its own terminal)
cd src/IdentityService && dotnet run
cd src/GatewayService && dotnet run
cd src/AuctionService && dotnet run
cd src/BiddingService && dotnet run
cd src/SearchService && dotnet run
cd src/NotificationService && dotnet run
# Frontend
cd frontend/webapp && npm install && npm run dev
# Admin console (separate repo path)
cd ../Hero-Exchange-Admin/admin-console && npm install && npm start
```

Services:
- Frontend: http://localhost:3000
- Gateway API: http://localhost:6001
- Identity: http://localhost:5000

## Usage Examples
**Create an auction (REST)**
```http
POST /api/auctions
Authorization: Bearer <token>
Content-Type: application/json
{
  "title": "Astrael Fallen",
  "reservePrice": 5000,
  "auctionEnd": "2025-12-31T23:59:00Z",
  "imageUrl": "/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angels_1/card/frame_0.png"
}
```

**Award progress (server action)**
```ts
import { awardGamification } from '@/app/actions/gamificationActions';
await awardGamification('bid', 1200);
```

**Bots (simulate activity)**
```bash
cd py-bots
cp .env.example .env  # set API_BASE/IDENTITY_URL/BOT_USERS/BOT_PASSWORD
python -m pytest      # run bot unit tests
python -m main        # start bots
```

## Project Structure
- `src/` – .NET services (Gateway, Identity, Auction, Bidding, Search, Notification)
- `frontend/webapp/` - Next.js marketplace
- `Hero-Exchange-Admin/` - Angular admin console (separate repo path)
- `py-bots/` - Python bot service + FastAPI admin API
- `tests/` - .NET tests (BiddingService, IdentityService)

## Testing
- Frontend: `cd frontend/webapp && npm test`
- Backend (.NET): `dotnet test HeroExchange.sln` (or per project, e.g., `dotnet test tests/BiddingService.Tests/BiddingService.Tests.csproj`, `tests/IdentityService.Tests`)
- Bots: `cd py-bots && python -m pytest`

## Future Improvements
1) Add integration tests for Gateway routing/Notification SignalR with WebApplicationFactory.
2) Expand admin console e2e tests (Playwright/Cypress) and secure it behind proper auth.
3) Harden Identity seeding/guest flow with rate limits and audit logging.

## License
Demo project for portfolio/educational purposes. No warranty.

## Contact
- Maintainer: Dion Upton (dionupton@protonmail.com)
- Live app: https://hero-exchange.live
