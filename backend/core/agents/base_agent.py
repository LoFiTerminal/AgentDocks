"""Base agent class for multi-agent system."""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from enum import Enum


class AgentRole(Enum):
    """Agent role types."""
    ORCHESTRATOR = "orchestrator"
    ARCHITECT = "architect"
    CODER = "coder"
    TESTER = "tester"
    REVIEWER = "reviewer"


class AgentStatus(Enum):
    """Agent status."""
    IDLE = "idle"
    THINKING = "thinking"
    WORKING = "working"
    WAITING = "waiting"
    DONE = "done"
    ERROR = "error"


class Message:
    """Message between agents."""
    def __init__(
        self,
        from_agent: str,
        to_agent: str,
        message_type: str,
        content: Any,
        metadata: Optional[Dict] = None
    ):
        self.from_agent = from_agent
        self.to_agent = to_agent
        self.message_type = message_type
        self.content = content
        self.metadata = metadata or {}


class BaseAgent(ABC):
    """Base class for all agents."""

    def __init__(
        self,
        agent_id: str,
        role: AgentRole,
        sandbox,
        provider,
        model: str
    ):
        self.agent_id = agent_id
        self.role = role
        self.sandbox = sandbox
        self.provider = provider
        self.model = model
        self.status = AgentStatus.IDLE
        self.message_queue: List[Message] = []
        self.context: Dict[str, Any] = {}

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get the agent's system prompt."""
        pass

    @abstractmethod
    def get_available_tools(self) -> List[str]:
        """Get list of tools this agent can use."""
        pass

    async def send_message(self, to_agent: str, message_type: str, content: Any):
        """Send message to another agent."""
        # Will be implemented by message bus
        pass

    async def receive_message(self, message: Message):
        """Receive message from another agent."""
        self.message_queue.append(message)

    async def process_task(self, task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a task assigned to this agent."""
        self.status = AgentStatus.WORKING
        self.context.update(context)
        
        try:
            result = await self._execute_task(task)
            self.status = AgentStatus.DONE
            return result
        except Exception as e:
            self.status = AgentStatus.ERROR
            return {"error": str(e)}

    @abstractmethod
    async def _execute_task(self, task: str) -> Dict[str, Any]:
        """Execute the actual task (implemented by subclasses)."""
        pass

    def get_status_info(self) -> Dict[str, Any]:
        """Get current agent status for UI."""
        return {
            "agent_id": self.agent_id,
            "role": self.role.value,
            "status": self.status.value,
            "context": self.context
        }
