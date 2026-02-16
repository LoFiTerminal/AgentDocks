"""Shared configuration module for accessing stored config."""

from models.schemas import OnboardingConfig
from typing import Optional

# Import from api.config to avoid circular imports
_config_storage: Optional[OnboardingConfig] = None


def save_config(config: OnboardingConfig) -> OnboardingConfig:
    """Save configuration to storage."""
    global _config_storage
    _config_storage = config
    return config


def get_config() -> Optional[OnboardingConfig]:
    """Get current configuration."""
    return _config_storage
