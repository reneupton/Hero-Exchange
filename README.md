# ⚔️ Hero Exchange: RPG Hero Marketplace

Welcome to **Hero Exchange**, a dark fantasy RPG hero marketplace where players collect, trade, and bid on legendary heroes. This demo project showcases modern development practices with a comprehensive hero collection system, auction mechanics, and engaging user experiences.

❗❗ This is a demo project using **Gold currency** for educational purposes only. No real money is involved. ❗❗

## ✨ Core Features

### Hero Collection System
- **10 Hero Archetypes**: Veyla, Elyra, Morr, Sigrun, Kael, Lyris, Theron, Zara, Draven, and Seraph
- **4 Rarity Tiers**: Common, Rare, Epic, and Legendary variants with stat scaling
- **Hero Stats**: Attack, Defense, Magic, Speed - each scales with rarity
- **Animated Sprites**: Idle and blink animations on hover
- **Hero Lore**: Rich backstories for each character

### Marketplace Features
- **Real-time Auctions**: Bid on hero cards using Gold currency
- **User Authentication**: Secure registration and login via Duende Identity Service
- **Live Notifications**: Real-time alerts for bids, auction endings, and admin actions
- **Hero Detail Modal**: View stats, lore, and place bids inline

### Progression System
- **Gold Wallet**: Virtual currency for bidding and purchases
- **Hero Power**: Level calculated from total hero stats (TotalHeroPower)
- **Mystery Summons**: Weighted rarity drops to obtain new heroes
- **Collection Tracking**: View owned heroes in sidebar

## 🎯 Hero Rarity System

| Rarity | Stat Multiplier | Drop Rate | Visual |
|--------|-----------------|-----------|--------|
| Common | 1.0× | 60% | Gray badge |
| Rare | 1.5× | 25% | Blue badge |
| Epic | 2.0× | 12% | Purple badge |
| Legendary | 3.0× | 3% | Gold badge with glow |

## 🛠️ Technical Stack

<p align="center">
  <img src="https://img.shields.io/badge/C%23-239120?style=flat&logo=c-sharp&logoColor=white" alt="C#">
  <img src="https://img.shields.io/badge/.NET%207-512BD4?style=flat&logo=dot-net&logoColor=white" alt=".NET">
  <img src="https://img.shields.io/badge/next%20js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="NextJS">
  <img src="https://img.shields.io/badge/react%2018-61DAFB?style=flat&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white" alt="RabbitMQ">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker">
</p>

### Frontend
- **Framework**: Next.js 13.4 with App Router
- **UI**: React 18 + TypeScript + TailwindCSS
- **Theme**: Dark RPG aesthetic with purple/amber accents
- **State**: Zustand for hero collection state
- **Real-time**: SignalR for live auction updates
- **Admin Console**: Angular 17+ standalone components

### Backend Microservices
- **Gateway Service**: API routing and load balancing
- **Identity Service**: Duende IdentityServer for JWT auth
- **Auction Service**: Hero listing and auction lifecycle
- **Bidding Service**: Real-time bid processing + hero collection
- **Search Service**: MongoDB-powered hero search
- **Notification Service**: SignalR WebSocket notifications

### Databases
- **PostgreSQL**: Users, auctions, hero ownership
- **MongoDB**: Search indices, bid history

## 🔧 Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │     │  Admin Console  │
│  (Hero Exchange)│     │    (Angular)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Gateway   │
              │   Service   │
              └──────┬──────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼───┐      ┌─────▼─────┐    ┌─────▼─────┐
│Identity│      │  Auction  │    │  Bidding  │
│Service │      │  Service  │    │  Service  │
└───┬────┘      └─────┬─────┘    └─────┬─────┘
    │                 │                │
    │           ┌─────▼─────┐          │
    │           │  RabbitMQ │          │
    │           └─────┬─────┘          │
    │                 │                │
┌───▼────┐      ┌─────▼─────┐    ┌─────▼─────┐
│PostgreSQL│    │  Search   │    │  Notify   │
└─────────┘     │  Service  │    │  Service  │
                └─────┬─────┘    └───────────┘
                      │
                ┌─────▼─────┐
                │  MongoDB  │
                └───────────┘
```

## 🚀 Getting Started

### Prerequisites
- .NET 7/8 SDK
- Node.js 18+
- Docker Desktop

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/reneupton/Hero-Exchange.git
cd Hero-Exchange
```

2. **Start infrastructure**
```bash
docker-compose up -d postgres mongodb rabbitmq
```

3. **Run backend services**
```bash
# In separate terminals
cd src/IdentityService && dotnet run
cd src/GatewayService && dotnet run
cd src/AuctionService && dotnet run
cd src/BiddingService && dotnet run
cd src/SearchService && dotnet run
cd src/NotificationService && dotnet run
```

4. **Run frontend**
```bash
cd frontend/webapp
npm install
npm run dev
```

5. **Access**
- Frontend: http://localhost:3000
- Gateway API: http://localhost:6001
- Identity: http://localhost:5000

### Admin Console

```bash
cd ../Hero-Exchange-Admin/admin-console
npm install
npm start
```

## 🐍 Bot Service

Python bots simulate marketplace activity:
```bash
cd py-bots
pip install -r requirements.txt
python -m main
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting guide using:
- **Vercel** (FREE) - Frontend + Admin Console
- **Railway** (~$10/month) - Backend services + databases

## 🎨 Theme

The UI features a dark fantasy RPG aesthetic:
- Dark backgrounds (`#0b1220`, `#0f172a`)
- Purple accents (`#8b5cf6`)
- Amber/gold highlights (`#f59e0b`)
- Cyan glow effects (`#22d3ee`)
- Glass panels with blur effects
- Cinzel font for headings

## 📝 License

Demo project for portfolio purposes. All code provided as-is for educational reference.

---

**Note**: This platform uses fictional Gold currency and is intended solely for demonstration purposes.
