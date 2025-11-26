import logging
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Settings
from bot_manager import BotManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI()
settings = Settings()
manager = BotManager(settings=settings)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await manager.start()
    logging.info("Bot manager started")


@app.on_event("shutdown")
async def shutdown_event():
    await manager.stop()
    logging.info("Bot manager stopped")


@app.get("/health")
async def health():
    return {"status": "ok", "running": manager.running}


@app.get("/admin/bots/status")
async def bot_status():
    return {"running": manager.running, "bots": manager.status()}


@app.post("/admin/bots/start")
async def bot_start():
    await manager.start()
    return {"status": "started", "bots": manager.status()}


@app.post("/admin/bots/stop")
async def bot_stop():
    await manager.stop()
    return {"status": "stopped"}


@app.get("/admin/bots/config")
async def get_config():
    return manager.config_snapshot()


@app.post("/admin/bots/config")
async def set_config(payload: Dict):
    await manager.apply_config(payload)
    return {"status": "applied", "config": manager.config_snapshot()}


@app.get("/admin/bots/activity")
async def activity():
    return {"events": manager.get_activity()}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("admin_api:app", host="0.0.0.0", port=8000, reload=False)
