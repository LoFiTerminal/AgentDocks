"""Shared configuration module for accessing stored config."""

from models.schemas import OnboardingConfig
from typing import Optional
import json
import os
from pathlib import Path

# Storage location
CONFIG_FILE = Path.home() / ".agentdocks" / "config.json"

# In-memory cache
_config_storage: Optional[OnboardingConfig] = None


def save_config(config: OnboardingConfig) -> OnboardingConfig:
    """Save configuration to storage."""
    global _config_storage
    _config_storage = config

    # Persist to disk
    try:
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config.model_dump(), f, indent=2)

        # Set secure file permissions (owner read/write only)
        os.chmod(CONFIG_FILE, 0o600)
    except Exception as e:
        print(f"Warning: Failed to persist config to disk: {e}")

    return config


def get_config() -> Optional[OnboardingConfig]:
    """Get current configuration."""
    global _config_storage

    # Return cached config if available
    if _config_storage:
        return _config_storage

    # Try to load from disk
    try:
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r') as f:
                data = json.load(f)
                _config_storage = OnboardingConfig(**data)
                return _config_storage
    except Exception as e:
        print(f"Warning: Failed to load config from disk: {e}")

    return None
