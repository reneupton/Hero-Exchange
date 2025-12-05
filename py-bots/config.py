"""Configuration for bot runtime, API targets, and behavior tuning."""
from pydantic import BaseSettings, AnyHttpUrl
from typing import List, Optional


class Settings(BaseSettings):
    """Environment-driven settings for bot behavior and service endpoints."""
    api_base: AnyHttpUrl = "https://gateway-service-production-a4ca.up.railway.app/"
    identity_url: Optional[AnyHttpUrl] = "https://identity-service-production-115a.up.railway.app/"

    # Default to seeded Identity users to avoid invalid_grant errors
    bot_users: str = "alice,bob"
    bot_password: str = "Pass123$"

    bid_rate_per_min: int = 2
    create_rate_per_min: float = 0.5
    mystery_interval_min: int = 60
    daily_interval_hours: int = 24

    max_bids_per_auction: int = 3
    max_active_auctions_per_bot: int = 2
    min_balance: int = 500
    auto_topup: bool = False

    categories: List[str] = ["Common", "Rare", "Epic", "Legendary"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
