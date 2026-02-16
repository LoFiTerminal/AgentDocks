"""AI Provider abstraction layer."""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import anthropic
import httpx


class BaseProvider(ABC):
    """Base class for AI providers."""

    @abstractmethod
    async def complete(
        self,
        messages: List[Dict[str, Any]],
        tools: List[Dict[str, Any]],
        model: str,
        system: Optional[str] = None
    ) -> Any:
        """Send a completion request to the AI provider."""
        pass


class AnthropicProvider(BaseProvider):
    """Anthropic Claude provider using official SDK."""

    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)

    async def complete(
        self,
        messages: List[Dict[str, Any]],
        tools: List[Dict[str, Any]],
        model: str,
        system: Optional[str] = None
    ) -> Any:
        """Send completion request to Anthropic."""
        kwargs = {
            "model": model,
            "messages": messages,
            "tools": tools,
            "max_tokens": 4096,
        }
        if system:
            kwargs["system"] = system

        response = self.client.messages.create(**kwargs)
        return response


class OpenRouterProvider(BaseProvider):
    """OpenRouter provider using httpx (Anthropic-compatible API)."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"

    async def complete(
        self,
        messages: List[Dict[str, Any]],
        tools: List[Dict[str, Any]],
        model: str,
        system: Optional[str] = None
    ) -> Any:
        """Send completion request to OpenRouter."""
        async with httpx.AsyncClient() as client:
            payload = {
                "model": model,
                "messages": messages,
                "tools": tools,
                "max_tokens": 4096,
            }
            if system:
                # OpenRouter accepts system as a message
                payload["messages"] = [
                    {"role": "system", "content": system}
                ] + messages

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            response = await client.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers,
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()

            # Convert OpenRouter response to Anthropic-like format
            return self._convert_response(data)

    def _convert_response(self, data: Dict[str, Any]) -> Any:
        """Convert OpenRouter response to Anthropic format."""
        # Simple conversion - OpenRouter uses similar structure
        choice = data["choices"][0]
        message = choice["message"]

        # Create a mock Anthropic response object
        class MockResponse:
            def __init__(self, content, stop_reason):
                self.content = content
                self.stop_reason = stop_reason

        # Parse content blocks
        content_blocks = []
        if message.get("content"):
            content_blocks.append(
                type('obj', (object,), {
                    'type': 'text',
                    'text': message["content"]
                })
            )

        # Check for tool calls
        if message.get("tool_calls"):
            for tool_call in message["tool_calls"]:
                content_blocks.append(
                    type('obj', (object,), {
                        'type': 'tool_use',
                        'id': tool_call["id"],
                        'name': tool_call["function"]["name"],
                        'input': tool_call["function"]["arguments"]
                    })
                )

        return MockResponse(
            content=content_blocks,
            stop_reason=choice.get("finish_reason", "end_turn")
        )


class OllamaProvider(BaseProvider):
    """Ollama local provider using httpx."""

    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    async def complete(
        self,
        messages: List[Dict[str, Any]],
        tools: List[Dict[str, Any]],
        model: str,
        system: Optional[str] = None
    ) -> Any:
        """Send completion request to local Ollama."""
        async with httpx.AsyncClient() as client:
            # Ollama format
            payload = {
                "model": model,
                "messages": messages,
                "tools": tools,
                "stream": False,
            }
            if system:
                payload["system"] = system

            response = await client.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120.0
            )
            response.raise_for_status()
            data = response.json()

            return self._convert_response(data)

    def _convert_response(self, data: Dict[str, Any]) -> Any:
        """Convert Ollama response to Anthropic format."""
        message = data.get("message", {})

        class MockResponse:
            def __init__(self, content, stop_reason):
                self.content = content
                self.stop_reason = stop_reason

        content_blocks = []
        if message.get("content"):
            content_blocks.append(
                type('obj', (object,), {
                    'type': 'text',
                    'text': message["content"]
                })
            )

        # Ollama tool calls
        if message.get("tool_calls"):
            for tool_call in message["tool_calls"]:
                content_blocks.append(
                    type('obj', (object,), {
                        'type': 'tool_use',
                        'id': tool_call.get("id", "unknown"),
                        'name': tool_call["function"]["name"],
                        'input': tool_call["function"]["arguments"]
                    })
                )

        return MockResponse(
            content=content_blocks,
            stop_reason=data.get("done_reason", "stop")
        )


def create_provider(provider_type: str, api_key: str, **kwargs) -> BaseProvider:
    """Factory function to create the appropriate provider."""
    if provider_type == "anthropic":
        return AnthropicProvider(api_key)
    elif provider_type == "openrouter":
        return OpenRouterProvider(api_key)
    elif provider_type == "ollama":
        base_url = kwargs.get("base_url", "http://localhost:11434")
        return OllamaProvider(base_url)
    else:
        raise ValueError(f"Unknown provider type: {provider_type}")
