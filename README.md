# 🎮 FlogIt Arena: Gamified Marketplace Demo

**🎯 DEMO PROJECT - Play with Fake FLOG Coins!**
*A fully functional marketplace with game mechanics, achievements, and virtual currency*

> 💡 **Note**: This is a demonstration project showcasing gamification mechanics and interactive features. All transactions use fake FLOG cryptocurrency - no real money involved!

> 🔗 **Original Project**: This is a fork of [FlogIt Marketplace](https://github.com/reneupton/FlogIt) - enhanced with gamification features for demonstration purposes.

---

## ✨ What Makes This Special

This isn't just another marketplace - it's a **gamified trading experience** where every action earns you rewards, levels you up, and unlocks achievements. Built to showcase:

- 🎮 **Game Mechanics in E-Commerce** - XP, levels, achievements, and quests
- 💰 **Virtual Economy** - Complete FLOG cryptocurrency system (demo only)
- 🎯 **User Engagement** - Daily quests, mystery boxes, and leaderboards
- ✨ **Visual Polish** - Animations, particle effects, and real-time updates
- 🤖 **AI Activity** - Bot traders create a lively marketplace atmosphere

---

## 🚀 Try These Features (Coming Soon!)

### 💰 Start with 1000 FREE FLOG Coins
Every new user gets a starter pack with fake cryptocurrency to begin trading immediately!

### 📈 Level Up System
- Earn XP from every action: listing items, making purchases, completing quests
- Progress from **Novice Trader** to **Trading Legend**
- Unlock new features and higher-tier items as you level up

### 🏆 Achievements & Quests
- **Daily Quests**: Login bonuses, trading goals, social interactions
- **Achievements**: First sale, speed trader, rare collector, and more
- **Rewards**: FLOG coins, XP boosts, and exclusive badges

### 💎 Rarity System
Items come in multiple rarity tiers with visual effects:
- ⚪ Common
- 🟢 Uncommon
- 🔵 Rare
- 🟣 Epic
- 🟠 Legendary

### 🎁 Mystery Boxes
Open boxes to get random rewards:
- Bronze Box (100 FLOG) - 1-2 items, mostly common
- Silver Box (250 FLOG) - 2-3 items, better odds
- Gold Box (500 FLOG) - 3+ items, legendary chances!

### 📊 Leaderboards
Compete with other traders for the top spot based on:
- Total FLOG earned
- Trading volume
- Level progression
- Achievement count

---

## 🛠️ Technical Stack & Architecture

<p align="center">
  <img src="https://img.shields.io/badge/C%23-239120?style=flat&logo=c-sharp&logoColor=white" alt="C#">
  <img src="https://img.shields.io/badge/.NET%208-512BD4?style=flat&logo=dot-net&logoColor=white" alt=".NET 8">
  <img src="https://img.shields.io/badge/next%20js-000000?style=flat&logo=nextdotjs&logoColor=white" alt="NextJS">
  <img src="https://img.shields.io/badge/react-61DAFB?style=flat&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white" alt="RabbitMQ">
  <img src="https://img.shields.io/badge/SignalR-512BD4?style=flat&logo=dot-net&logoColor=white" alt="SignalR">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white" alt="Kubernetes">
</p>

### Microservices Architecture

- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, and real-time SignalR integration
- **Backend**: ASP.NET Core 8 microservices with clean architecture
- **Authentication**: Duende IdentityServer with JWT tokens
- **Real-time**: SignalR for live notifications and activity feeds
- **Messaging**: RabbitMQ for asynchronous event processing
- **Databases**: PostgreSQL (relational data) + MongoDB (flexible schemas)
- **Infrastructure**: Docker containers orchestrated with Kubernetes

---

## 🎯 Planned Features

### 💰 FLOG Cryptocurrency System
- Virtual wallet for each user
- Transaction history tracking
- Exchange rate display (fake rates for realism)
- Earning mechanisms: quests, sales, achievements
- Spending options: purchases, mystery boxes, upgrades

### 🎮 Gamification Layer
- **XP System**: Earn experience from all activities
- **Leveling**: 50 levels from Novice to Legend
- **Titles**: Unlock prestigious titles as you progress
- **Streaks**: Daily login bonuses with streak multipliers
- **Progress Tracking**: Visual bars and statistics

### 🏪 Marketplace Features
- **Buy/Sell**: Direct purchases with FLOG coins
- **Instant Transactions**: No waiting for auctions to end
- **Item Listings**: Photo uploads or emoji representations
- **Search & Filter**: By category, price, rarity
- **Activity Feed**: Live updates of marketplace activity
- **User Ratings**: Build reputation through trades

### 🤖 Demo Enhancements
- **Bot Traders**: AI-powered traders create activity
- **Demo Data**: Pre-seeded items and users
- **Tutorial Flow**: Guided onboarding for new users
- **Reset Function**: Start fresh anytime
- **Fake Ads**: "Watch ad" for instant FLOG (no real ads)

---

## 🔧 Backend Services

### Marketplace Service *(New)*
Core trading functionality with FLOG integration:
- Item listings and management
- Purchase processing with virtual currency
- Seller reputation system
- Category and search management

### Gamification Service *(New)*
Handles all game mechanics:
- XP calculation and level progression
- Quest generation and tracking
- Achievement unlocking
- Leaderboard rankings
- Mystery box logic

### Wallet Service *(New)*
FLOG cryptocurrency management:
- User wallet creation
- Transaction processing
- Balance tracking
- Transaction history
- Earning and spending events

### Auction Service *(Existing)*
- **Framework**: ASP.NET Core
- **Functionality**: Centralized management of auction activities. Integrates with RabbitMQ for synchronous updates and provides endpoints for auction-related tasks.

### Bidding Service *(Existing)*
- **Framework**: ASP.NET Core
- **Functionality**: Handles bid lifecycle, communicating with the Auction Service via gRPC. RabbitMQ assists in delivering instantaneous bid notifications.

### Gateway Service
- **Framework**: ASP.NET Core
- **Functionality**: Manages incoming requests, ensuring they're dispatched to the appropriate service.

### Identity Service
- **Framework**: Duende IdentityServer
- **Functionality**: Oversees authentication and authorization, dispensing JWT tokens for verified sessions.

### Notification Service
- **Framework**: ASP.NET Core SignalR
- **Functionality**: Ensures users receive real-time notifications, leveraging the capabilities of SignalR and RabbitMQ.

### Search Service
- **Framework**: ASP.NET Core
- **Functionality**: Provides efficient item search capabilities, interacting with the Auction Service and utilizing RabbitMQ for real-time updates.

### Bot Service *(Enhanced)*
Simulates marketplace activity:
- Automated buying and selling
- Random item listings
- Realistic trading patterns
- Keeps marketplace lively

---

## 📊 User Journey (Planned)

### 1️⃣ Sign Up & Get Started
- Register and receive **1000 FLOG** starter balance
- Get welcome achievement and starter boost
- Tutorial guides through first actions

### 2️⃣ First Purchase
- Browse items with rarity indicators
- Make purchase with FLOG coins
- Unlock "First Purchase" achievement
- Earn 50 XP and level up

### 3️⃣ List Your First Item
- Upload photos or select emoji
- Set price and rarity tier
- Earn listing reward (+10 FLOG, +25 XP)
- Bot may purchase within minutes!

### 4️⃣ Daily Engagement
- Login for daily bonus (+50 FLOG)
- Complete daily quests (up to +200 FLOG)
- Open mystery boxes
- Climb the leaderboard

### 5️⃣ Become a Trading Legend
- Reach level 50
- Earn all achievements
- Trade legendary items
- Top the leaderboard

---

## 🎨 Visual Features (Planned)

### Animations & Effects
- ✨ **Confetti** on successful purchases
- 💰 **Coin rain** when earning FLOG
- 📈 **Level up** animations with sound effects
- 🎁 **Mystery box** opening sequences
- 💎 **Rarity glows** on rare items
- 🏆 **Achievement popups** with particle effects

### UI Components
- Real-time progress bars
- Animated notifications
- Interactive quest tracker
- Live activity feed
- Smooth transitions
- Mobile-responsive design

---

## 🌍 Deployment

- **Live Application**: Experience the platform firsthand at [FlogIt Demo App](https://app.flogitdemoapp.co.uk)
- **Identity Server**: Isolated hosting to optimize authentication processes
- **Microservices**: Hosted on cloud-based Kubernetes clusters
- **CI/CD**: GitHub Actions for automated deployment

---

## 💡 Why This Project?

This project demonstrates:

✅ **Full-Stack Expertise**: Complex backend + polished frontend
✅ **Modern Architecture**: Microservices, event-driven, real-time
✅ **Creative Problem Solving**: Gamification in unconventional contexts
✅ **User Experience**: Engaging, fun, and intuitive
✅ **Technical Depth**: Virtual economy, progression systems, bot AI
✅ **Production Quality**: Testing, deployment, monitoring

---

## 🚦 Getting Started

### Prerequisites
- Docker Desktop
- .NET 8 SDK
- Node.js 18+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/reneupton/FlogIt-Arena.git

# Start infrastructure
docker-compose up -d

# Run backend services
dotnet run --project src/GatewayService

# Run frontend
cd frontend/webapp
npm install
npm run dev
```

Visit `http://localhost:3000` and start trading with fake FLOG coins!

---

## 📚 Comparison to Original FlogIt

This is a fork of the original **[FlogIt Marketplace](https://github.com/reneupton/FlogIt)** project.

| Feature | Original FlogIt | FlogIt Arena |
|---------|----------------|--------------|
| **Purpose** | Production-ready auction platform | Experimental gamified marketplace |
| **Focus** | Clean architecture, reliability | Gamification, user engagement |
| **Currency** | Real money concepts | Fake FLOG cryptocurrency |
| **Trading** | Auction-based bidding | Instant buy/sell + auctions |
| **Gamification** | None | XP, levels, achievements, quests |
| **Target Audience** | E-commerce/enterprise roles | Creative/innovative companies |

Both projects showcase different aspects of full-stack development and serve different purposes in demonstrating technical capabilities.

---

## 🚧 Development Status

This project is currently under active development. Features are being implemented in phases:

**Phase 1**: Backend Foundation (In Progress)
- ✅ Repository fork and setup
- 🔄 GamificationService microservice
- 🔄 FLOG wallet system
- 🔄 Quest and achievement systems

**Phase 2**: Database & API (Planned)
- Database schema updates
- API endpoints for wallet operations
- Quest and achievement APIs

**Phase 3**: Frontend Components (Planned)
- FLOG wallet display
- Quest tracker UI
- Level progress indicators
- Achievement notifications

**Phase 4**: Visual Polish (Planned)
- Animations and effects
- Rarity visual indicators
- Purchase celebrations

**Phase 5**: Demo Features (Planned)
- Bot activity simulation
- Demo data seeding
- Tutorial flow

---

## 🤝 Contributing

This is a portfolio demonstration project, but suggestions and feedback are welcome!

---

## 📄 License

MIT License - Feel free to explore and learn from the code

---

**⚠️ Disclaimer**: This is a demonstration project using fake cryptocurrency (FLOG coins). No real money, blockchain, or actual cryptocurrency is involved. All transactions are simulated for demo purposes.
