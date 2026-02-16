"""Communication infrastructure for multi-agent system."""

from .message_bus import MessageBus
from .shared_context import SharedContext

__all__ = [
    "MessageBus",
    "SharedContext",
]
