"""Configuration API endpoints."""

from fastapi import APIRouter, HTTPException
from models.schemas import OnboardingConfig
from app.config import save_config, get_config

router = APIRouter(prefix="/api/config", tags=["config"])


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
