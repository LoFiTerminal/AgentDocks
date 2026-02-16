"""Message Bus for inter-agent communication."""

from typing import Dict, List, Callable, Any
from asyncio import Queue
import asyncio
from ..agents.base_agent import Message


class MessageBus:
    """
    Central message bus for agent communication.
    Handles routing, queuing, and delivery of messages between agents.
    """

    def __init__(self):
        self.agents: Dict[str, Any] = {}  # agent_id -> agent instance
        self.message_queues: Dict[str, Queue] = {}  # agent_id -> message queue
        self.message_history: List[Message] = []  # For UI/debugging
        self.subscribers: Dict[str, List[Callable]] = {}  # event_type -> [callbacks]

    def register_agent(self, agent):
        """Register an agent with the message bus."""
        self.agents[agent.agent_id] = agent
        self.message_queues[agent.agent_id] = Queue()
        print(f"✓ Registered agent: {agent.agent_id} ({agent.role.value})")

    def unregister_agent(self, agent_id: str):
        """Remove an agent from the message bus."""
        if agent_id in self.agents:
            del self.agents[agent_id]
            del self.message_queues[agent_id]

    async def send_message(
        self,
        from_agent: str,
        to_agent: str,
        message_type: str,
        content: Any,
        metadata: Dict = None
    ):
        """Send a message from one agent to another."""
        message = Message(
            from_agent=from_agent,
            to_agent=to_agent,
            message_type=message_type,
            content=content,
            metadata=metadata or {}
        )

        # Store in history for UI
        self.message_history.append(message)

        # Deliver to recipient
        if to_agent in self.message_queues:
            await self.message_queues[to_agent].put(message)
            
            # Notify subscribers
            await self._notify_subscribers("message_sent", message)
            
            print(f"📨 {from_agent} → {to_agent}: {message_type}")
        else:
            print(f"⚠️  Agent {to_agent} not found")

    async def broadcast_message(
        self,
        from_agent: str,
        message_type: str,
        content: Any
    ):
        """Broadcast a message to all agents."""
        for agent_id in self.agents:
            if agent_id != from_agent:
                await self.send_message(
                    from_agent=from_agent,
                    to_agent=agent_id,
                    message_type=message_type,
                    content=content
                )

    async def get_messages(self, agent_id: str, timeout: float = None) -> List[Message]:
        """Get all pending messages for an agent."""
        messages = []
        queue = self.message_queues.get(agent_id)
        
        if not queue:
            return messages

        # Get all available messages
        while not queue.empty():
            try:
                message = await asyncio.wait_for(queue.get(), timeout=timeout or 0.1)
                messages.append(message)
            except asyncio.TimeoutError:
                break

        return messages

    def subscribe(self, event_type: str, callback: Callable):
        """Subscribe to message bus events."""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)

    async def _notify_subscribers(self, event_type: str, data: Any):
        """Notify all subscribers of an event."""
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                await callback(data)

    def get_message_history(self, limit: int = 100) -> List[Dict]:
        """Get recent message history for UI."""
        return [
            {
                "from": msg.from_agent,
                "to": msg.to_agent,
                "type": msg.message_type,
                "content": msg.content,
                "metadata": msg.metadata
            }
            for msg in self.message_history[-limit:]
        ]

    def get_conversation(self, agent1: str, agent2: str) -> List[Message]:
        """Get conversation between two agents."""
        return [
            msg for msg in self.message_history
            if (msg.from_agent == agent1 and msg.to_agent == agent2) or
               (msg.from_agent == agent2 and msg.to_agent == agent1)
        ]
