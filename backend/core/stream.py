"""Server-Sent Events (SSE) streaming helpers."""

import json
from typing import Dict, Any, AsyncGenerator


def format_sse(event_type: str, data: Dict[str, Any]) -> str:
    """Format data as Server-Sent Event."""
    json_data = json.dumps({"type": event_type, "data": data})
    return f"data: {json_data}\n\n"


async def stream_status(message: str) -> str:
    """Stream a status update."""
    return format_sse("status", {"message": message})


async def stream_tool_use(tool: str, input_data: Dict[str, Any]) -> str:
    """Stream a tool use event."""
    return format_sse("tool_use", {"tool": tool, "input": input_data})


async def stream_tool_result(result: Any, is_error: bool = False) -> str:
    """Stream a tool result."""
    return format_sse("tool_result", {"result": result, "is_error": is_error})


async def stream_text(content: str) -> str:
    """Stream AI text response."""
    return format_sse("text", {"content": content})


async def stream_file(path: str, size: int) -> str:
    """Stream file info."""
    return format_sse("file", {"path": path, "size": size})


async def stream_error(message: str) -> str:
    """Stream an error."""
    return format_sse("error", {"message": message})


async def stream_done(message: str = "Task complete. Sandbox destroyed.") -> str:
    """Stream completion event."""
    return format_sse("done", {"message": message})
