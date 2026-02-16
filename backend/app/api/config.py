"""Configuration API endpoints."""

from fastapi import APIRouter, HTTPException
from models.schemas import OnboardingConfig
from typing import Optional

router = APIRouter(prefix="/api/config", tags=["config"])

# In-memory storage for demo (replace with database in production)
_config_storage: Optional[OnboardingConfig] = None


def save_config(config: OnboardingConfig) -> OnboardingConfig:
    """Save configuration to storage."""
    global _config_storage
    _config_storage = config
    return config


def get_config() -> Optional[OnboardingConfig]:
    """Get current configuration."""
    return _config_storage


@router.post("")
async def create_config(config: OnboardingConfig):
    """Save onboarding configuration."""
    try:
        saved_config = save_config(config)
        return {
            "success": True,
            "message": "Configuration saved successfully",
            "config": {
                "provider": saved_config.provider,
                "model": saved_config.model,
                "sandbox": saved_config.sandbox,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def read_config():
    """Get current configuration."""
    config = get_config()
    if config is None:
        raise HTTPException(status_code=404, detail="No configuration found")

    return {
        "provider": config.provider,
        "model": config.model,
        "sandbox": config.sandbox,
    }
