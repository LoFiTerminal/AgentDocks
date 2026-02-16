"""API key verification endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import anthropic

router = APIRouter(prefix="/api/config", tags=["verification"])


class VerifyKeyRequest(BaseModel):
    provider: str
    key: str


@router.post("/verify-key")
async def verify_key(request: VerifyKeyRequest):
    """
    Verify that an API key is valid by making a minimal request to the provider.
    """
    provider = request.provider
    key = request.key

    try:
        if provider == "anthropic":
            # Try to create a minimal message to verify the key
            try:
                client = anthropic.Anthropic(api_key=key)
                # Just validate the key format and make a minimal request
                response = client.messages.create(
                    model="claude-haiku-4-5-20251001",  # Cheapest model
                    max_tokens=1,
                    messages=[{"role": "user", "content": "test"}]
                )
                return {"valid": True, "message": "Anthropic key verified!"}
            except anthropic.AuthenticationError:
                return {"valid": False, "message": "Invalid Anthropic API key"}
            except Exception as e:
                return {"valid": False, "message": f"Verification failed: {str(e)}"}

        elif provider == "openrouter":
            # Check OpenRouter key
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://openrouter.ai/api/v1/auth/key",
                        headers={"Authorization": f"Bearer {key}"},
                        timeout=10.0
                    )
                    if response.status_code == 200:
                        data = response.json()
                        return {"valid": True, "message": "OpenRouter key verified!"}
                    else:
                        return {"valid": False, "message": "Invalid OpenRouter API key"}
            except Exception as e:
                return {"valid": False, "message": f"Verification failed: {str(e)}"}

        elif provider == "e2b":
            # Verify E2B key by trying to list sandboxes
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://api.e2b.dev/sandboxes",
                        headers={"X-API-Key": key},
                        timeout=10.0
                    )
                    if response.status_code == 200:
                        return {"valid": True, "message": "E2B key verified!"}
                    elif response.status_code == 401:
                        return {"valid": False, "message": "Invalid E2B API key"}
                    else:
                        return {"valid": False, "message": f"E2B error: {response.status_code}"}
            except Exception as e:
                return {"valid": False, "message": f"Verification failed: {str(e)}"}

        else:
            return {"valid": False, "message": f"Unknown provider: {provider}"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
