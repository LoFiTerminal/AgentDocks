"""
Storage abstraction for agent runs.
Supports Cloudflare R2 (S3-compatible) with local file fallback.
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
from abc import ABC, abstractmethod


class Storage(ABC):
    """Abstract storage interface."""

    @abstractmethod
    def store_run(self, share_id: str, data: Dict[str, Any]) -> None:
        """Store a run."""
        pass

    @abstractmethod
    def get_run(self, share_id: str) -> Optional[Dict[str, Any]]:
        """Get a run by ID. Returns None if not found."""
        pass

    @abstractmethod
    def exists(self, share_id: str) -> bool:
        """Check if a run exists."""
        pass


class R2Storage(Storage):
    """Cloudflare R2 storage using boto3 (S3-compatible)."""

    def __init__(self):
        import boto3

        # R2 credentials from environment
        account_id = os.getenv("R2_ACCOUNT_ID")
        access_key = os.getenv("R2_ACCESS_KEY")
        secret_key = os.getenv("R2_SECRET_KEY")
        bucket_name = os.getenv("R2_BUCKET_NAME")

        if not all([account_id, access_key, secret_key, bucket_name]):
            raise ValueError("Missing R2 configuration. Set R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET_NAME")

        # R2 endpoint format: https://{account_id}.r2.cloudflarestorage.com
        endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
        self.bucket_name = bucket_name

    def store_run(self, share_id: str, data: Dict[str, Any]) -> None:
        """Store a run in R2."""
        key = f"runs/{share_id}.json"
        body = json.dumps(data, indent=2)
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=body,
            ContentType="application/json",
        )

    def get_run(self, share_id: str) -> Optional[Dict[str, Any]]:
        """Get a run from R2."""
        try:
            key = f"runs/{share_id}.json"
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=key,
            )
            body = response["Body"].read().decode("utf-8")
            return json.loads(body)
        except self.s3_client.exceptions.NoSuchKey:
            return None
        except Exception:
            return None

    def exists(self, share_id: str) -> bool:
        """Check if a run exists in R2."""
        try:
            key = f"runs/{share_id}.json"
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=key,
            )
            return True
        except Exception:
            return False


class LocalStorage(Storage):
    """Local file storage fallback."""

    def __init__(self):
        self.data_dir = Path("./data/runs")
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def store_run(self, share_id: str, data: Dict[str, Any]) -> None:
        """Store a run locally."""
        file_path = self.data_dir / f"{share_id}.json"
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)

    def get_run(self, share_id: str) -> Optional[Dict[str, Any]]:
        """Get a run from local storage."""
        file_path = self.data_dir / f"{share_id}.json"
        if not file_path.exists():
            return None
        with open(file_path, "r") as f:
            return json.load(f)

    def exists(self, share_id: str) -> bool:
        """Check if a run exists locally."""
        file_path = self.data_dir / f"{share_id}.json"
        return file_path.exists()


def get_storage() -> Storage:
    """
    Get storage instance based on environment configuration.
    Falls back to local storage if R2 is not configured.
    """
    # Check if R2 is configured
    r2_configured = all([
        os.getenv("R2_ACCOUNT_ID"),
        os.getenv("R2_ACCESS_KEY"),
        os.getenv("R2_SECRET_KEY"),
        os.getenv("R2_BUCKET_NAME"),
    ])

    if r2_configured:
        try:
            return R2Storage()
        except Exception as e:
            print(f"Warning: Failed to initialize R2 storage, falling back to local: {e}")
            return LocalStorage()
    else:
        print("Info: R2 not configured, using local storage")
        return LocalStorage()
