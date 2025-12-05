import os

from config import Settings


def test_settings_defaults_and_env_override(monkeypatch):
    """Settings should load defaults and allow environment overrides."""
    monkeypatch.setenv("API_BASE", "https://example.com/")
    monkeypatch.setenv("BOT_USERS", "user1,user2")
    cfg = Settings()

    assert str(cfg.api_base) == "https://example.com/"
    assert cfg.bot_users == "user1,user2"
    assert cfg.bid_rate_per_min == 2
    assert cfg.categories == ["Common", "Rare", "Epic", "Legendary"]
