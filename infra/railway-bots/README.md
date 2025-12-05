## Railway deployment: bot admin service

Use this to run the marketplace bots continuously on Railway. The existing Dockerfile under `py-bots/dockerfile` boots the FastAPI admin API and starts the bot manager on container startup.

### Steps
1. Create a new service in your Railway project.
2. Build type: **Dockerfile**. Set **Dockerfile path** to `py-bots/dockerfile`.
3. Health check (optional): `/health`.
4. Env vars (required):
   - `API_BASE=https://gateway-service-production-a4ca.up.railway.app/`
   - `IDENTITY_URL=https://identity-service-production-115a.up.railway.app/`
   - `BOT_USERS=alice,bob` (or your seeded bot usernames)
   - `BOT_PASSWORD=Pass123$` (match your Identity seed)
5. Ports: Railway injects `PORT`; Dockerfile respects `${PORT:-8000}`.
6. Auto-deploy from `master` so updates roll out automatically.

### Endpoints (behind Railway domain)
- `GET /health` — liveness
- `GET /admin/bots/status`
- `POST /admin/bots/start`
- `POST /admin/bots/stop`
- `GET/POST /admin/bots/config`
- `GET /admin/bots/activity`

⚠️ Security: by default the admin API is open. Keep this service private inside Railway or add a reverse proxy/token guard if exposing publicly.
