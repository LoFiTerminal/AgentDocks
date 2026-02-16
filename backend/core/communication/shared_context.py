"""Shared context for agent collaboration."""

from typing import Dict, Any, List, Optional
from datetime import datetime


class SharedContext:
    """
    Shared workspace for agents to store and retrieve information.
    Acts as a shared memory/blackboard for the multi-agent system.
    """

    def __init__(self):
        self.data: Dict[str, Any] = {}
        self.metadata: Dict[str, Dict] = {}  # Metadata about each key
        self.history: List[Dict] = []  # Change history

    def set(self, key: str, value: Any, agent_id: str, description: str = ""):
        """Set a value in shared context."""
        old_value = self.data.get(key)
        
        self.data[key] = value
        self.metadata[key] = {
            "set_by": agent_id,
            "timestamp": datetime.now().isoformat(),
            "description": description
        }

        # Record history
        self.history.append({
            "action": "set",
            "key": key,
            "old_value": old_value,
            "new_value": value,
            "agent_id": agent_id,
            "timestamp": datetime.now().isoformat()
        })

        print(f"📝 {agent_id} set {key}: {description or str(value)[:50]}")

    def get(self, key: str, default: Any = None) -> Any:
        """Get a value from shared context."""
        return self.data.get(key, default)

    def has(self, key: str) -> bool:
        """Check if key exists."""
        return key in self.data

    def delete(self, key: str, agent_id: str):
        """Delete a key from shared context."""
        if key in self.data:
            value = self.data[key]
            del self.data[key]
            
            self.history.append({
                "action": "delete",
                "key": key,
                "value": value,
                "agent_id": agent_id,
                "timestamp": datetime.now().isoformat()
            })

    def get_metadata(self, key: str) -> Optional[Dict]:
        """Get metadata about a key."""
        return self.metadata.get(key)

    def get_all(self) -> Dict[str, Any]:
        """Get all shared data."""
        return self.data.copy()

    def get_history(self, limit: int = 50) -> List[Dict]:
        """Get recent change history."""
        return self.history[-limit:]

    def clear(self):
        """Clear all shared data."""
        self.data.clear()
        self.metadata.clear()
        self.history.append({
            "action": "clear_all",
            "timestamp": datetime.now().isoformat()
        })

    # Convenience methods for common data types
    
    def set_plan(self, plan: str, agent_id: str):
        """Set the architecture/implementation plan."""
        self.set("plan", plan, agent_id, "Architecture/implementation plan")

    def get_plan(self) -> Optional[str]:
        """Get the current plan."""
        return self.get("plan")

    def set_files_to_modify(self, files: List[str], agent_id: str):
        """Set list of files that need modification."""
        self.set("files_to_modify", files, agent_id, f"{len(files)} files to modify")

    def get_files_to_modify(self) -> List[str]:
        """Get list of files to modify."""
        return self.get("files_to_modify", [])

    def add_test_result(self, test_name: str, result: Dict, agent_id: str):
        """Add a test result."""
        results = self.get("test_results", {})
        results[test_name] = result
        self.set("test_results", results, agent_id, f"Test: {test_name}")

    def get_test_results(self) -> Dict:
        """Get all test results."""
        return self.get("test_results", {})

    def set_code_review(self, review: Dict, agent_id: str):
        """Set code review results."""
        self.set("code_review", review, agent_id, "Code review completed")

    def get_code_review(self) -> Optional[Dict]:
        """Get code review results."""
        return self.get("code_review")
