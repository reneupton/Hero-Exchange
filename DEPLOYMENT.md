# Hero Exchange - Deployment Guide

## Cost Estimate: ~$10-15/month total

| Service | Platform | Cost |
|---------|----------|------|
| Frontend (webapp) | Vercel | FREE |
| Admin Console | Vercel | FREE |
| PostgreSQL | Railway | ~$5/month |
| MongoDB | Railway | ~$5/month |
| RabbitMQ | CloudAMQP | FREE (Little Lemur) |
| .NET Services (6) | Railway | FREE tier / ~$5/month |
| Python Bots | Local PC | FREE |

---

## Step 1: Deploy Frontend to Vercel (FREE)

### Prerequisites
- GitHub account connected to your repos
- Vercel account (sign up at vercel.com with GitHub)

### Deploy Next.js Webapp

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import `FlogIt-Tech` repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend/webapp`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables (click "Environment Variables"):
   ```
   NEXT_PUBLIC_API_URL=https://your-gateway.railway.app
   NEXT_PUBLIC_NOTIFY_URL=https://your-gateway.railway.app/notifications
   NEXTAUTH_SECRET=generate-a-strong-random-string-here
   NEXTAUTH_URL=https://your-vercel-app.vercel.app
   ID_URL=https://your-identity.railway.app
   API_URL=https://your-gateway.railway.app/
   CLIENT_SECRET=secret
   ```
   (Leave these as placeholders - we'll update after Railway setup)

6. Click "Deploy"

### Deploy Admin Console (Angular)

1. In Vercel, click "Add New Project"
2. Import `FlogIt-Admin` repository
3. Configure:
   - **Framework Preset**: Angular
   - **Root Directory**: `admin-console`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist/admin-console/browser`
4. Click "Deploy"

---

## Step 2: Set Up Railway (~$10/month)

### Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create a new project called "hero-exchange"

### Deploy Databases

#### PostgreSQL
1. In your project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Once deployed, click on it and go to "Variables"
4. Copy the `DATABASE_URL` - you'll need this

#### MongoDB
1. Click "+ New" → "Database" → "MongoDB"
2. Copy the `MONGO_URL` from variables

#### RabbitMQ (Use CloudAMQP - FREE tier)
1. Go to [cloudamqp.com](https://www.cloudamqp.com/)
2. Sign up and create a "Little Lemur" instance (FREE)
3. Copy the AMQP URL (looks like `amqps://user:pass@hostname/vhost`)

---

## Step 3: Deploy .NET Services to Railway

For each service, you'll add it from your GitHub repo:

### Identity Service
1. Click "+ New" → "GitHub Repo"
2. Select your `FlogIt-Tech` repo
3. Configure:
   - **Root Directory**: `/`
   - **Build Command**: Leave default (Railway auto-detects .NET)
   - **Dockerfile Path**: `src/IdentityService/dockerfile`

4. Add Environment Variables:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:80
   ConnectionStrings__DefaultConnection=<your-railway-postgres-url>
   ClientApp=https://your-vercel-app.vercel.app
   ClientSecret=secret
   ```

### Gateway Service
Same process with these env vars:
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
ClientApp=https://your-vercel-app.vercel.app
```

### Auction Service
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
RabbitMq__Host=<cloudamqp-host>
RabbitMq__Username=<cloudamqp-user>
RabbitMq__Password=<cloudamqp-pass>
ConnectionStrings__DefaultConnection=<railway-postgres-url>
IdentityServiceUrl=https://your-identity.railway.app
```

### Bid Service
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
RabbitMq__Host=<cloudamqp-host>
ConnectionStrings__BidDbConnection=<railway-mongodb-url>
IdentityServiceUrl=https://your-identity.railway.app
GrpcAuction=https://your-auction.railway.app:7777
```

### Search Service
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
RabbitMq__Host=<cloudamqp-host>
ConnectionStrings__MongoDbConnection=<railway-mongodb-url>
AuctionServiceUrl=https://your-auction.railway.app
```

### Notify Service
```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
RabbitMq__Host=<cloudamqp-host>
ClientApp=https://your-vercel-app.vercel.app
```

---

## Step 4: Update Vercel Environment Variables

Once all Railway services are deployed, go back to Vercel and update:

1. Go to your webapp project → Settings → Environment Variables
2. Update with actual Railway URLs:
   ```
   NEXT_PUBLIC_API_URL=https://gateway-xxxxx.railway.app
   NEXT_PUBLIC_NOTIFY_URL=https://gateway-xxxxx.railway.app/notifications
   ID_URL=https://identity-xxxxx.railway.app
   API_URL=https://gateway-xxxxx.railway.app/
   ```
3. Trigger a redeploy

---

## Step 5: Run Python Bots Locally

The easiest/cheapest option is running bots on your local machine:

```bash
cd py-bots
pip install -r requirements.txt

# Create .env file
echo "API_BASE=https://your-gateway.railway.app/" > .env
echo "IDENTITY_URL=https://your-identity.railway.app/" >> .env
echo "BOT_USERS=alice,bob" >> .env
echo "BOT_PASSWORD=Pass123$" >> .env

# Run
python -m main
```

Or run with Docker:
```bash
docker-compose up bot-admin
```

---

## Step 6: Configure Identity Service CORS & Clients

You'll need to update the Identity Service to allow your new domains:

In `src/IdentityService/HostingExtensions.cs`, ensure CORS allows:
- `https://your-app.vercel.app`
- `https://your-admin.vercel.app`

In `src/IdentityService/Config.cs`, update the client redirect URIs.

---

## Troubleshooting

### "Username and password required" in GitHub Actions
Your existing workflows try to deploy to DigitalOcean. You can:
1. Disable them (delete the workflow files)
2. Or add secrets to GitHub (Settings → Secrets → Actions):
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_PASSWORD`
   - `DIGITALOCEAN_ACCESS_TOKEN`

### CORS errors
Make sure all services have the correct `ClientApp` URLs in their environment variables.

### Database connection issues
- Ensure the connection strings use the full Railway URL
- For MongoDB, the URL format is: `mongodb://user:pass@host:port/db?authSource=admin`

---

## Domain Setup (Optional)

To use a custom domain like `heroexchange.com`:

1. **Vercel**: Settings → Domains → Add your domain
2. **Railway**: Each service has a "Settings" → "Networking" → Custom domain

---

## Architecture Diagram

```
                    ┌─────────────────┐
                    │   Your Browser  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Vercel    │  │   Vercel    │  │  Local PC   │
    │   Webapp    │  │Admin Console│  │  Py Bots    │
    │   (FREE)    │  │   (FREE)    │  │   (FREE)    │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    Railway Gateway      │
              │    (routes requests)    │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │Identity │      │ Auction │      │  Bid    │
    │ Service │      │ Service │      │ Service │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                │
         ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │Postgres │      │Postgres │      │ MongoDB │
    │(Railway)│      │(Railway)│      │(Railway)│
    └─────────┘      └─────────┘      └─────────┘
```
