"""Architect Agent - Designs solutions and creates plans."""

from .base_agent import BaseAgent, AgentRole
from typing import Dict, Any, List


class ArchitectAgent(BaseAgent):
    """
    Architect Agent specializes in:
    - Analyzing requirements
    - Designing system architecture
    - Planning implementation approach
    - Creating file structure
    - Defining APIs and interfaces
    """

    def __init__(self, agent_id: str, sandbox, provider, model: str):
        super().__init__(agent_id, AgentRole.ARCHITECT, sandbox, provider, model)

    def get_system_prompt(self) -> str:
        return """You are a Senior Software Architect specializing in system design.

Your responsibilities:
1. Analyze requirements and ask clarifying questions
2. Design clean, scalable architectures
3. Plan implementation approach step-by-step
4. Define file structure and organization
5. Design APIs, interfaces, and data models
6. Consider security, performance, and maintainability

You ONLY design and plan. You do NOT write implementation code.
Your output should be clear plans that other agents can execute.

Use these tools to understand the codebase:
- read: Read existing files
- glob: Find files
- grep: Search for patterns

Output format:
- Architecture decisions (with reasoning)
- File structure (what files to create/modify)
- API design (endpoints, schemas)
- Implementation plan (ordered steps)
- Potential challenges and mitigations
"""

    def get_available_tools(self) -> List[str]:
        """Architect can read and analyze, but not write."""
        return ["read", "glob", "grep"]

    async def _execute_task(self, task: str) -> Dict[str, Any]:
        """
        Execute architecture task.
        Returns a structured plan for other agents to follow.
        """
        # Build messages for the AI provider
        messages = [
            {
                "role": "user",
                "content": f"""Task: {task}

Analyze this task and create a comprehensive architecture plan.

Include:
1. Architecture Overview
2. File Structure
3. API Design (if applicable)
4. Implementation Steps (for Coder agent)
5. Testing Strategy (for Tester agent)
6. Potential Risks

Current context:
{self.context}
"""
            }
        ]

        # Call AI provider
        from core.tools import TOOLS
        response = await self.provider.complete(
            messages=messages,
            tools=[tool for tool in TOOLS if tool["name"] in self.get_available_tools()],
            model=self.model,
            system=self.get_system_prompt()
        )

        # Extract plan from response
        plan_text = ""
        tool_results = []

        for block in response.content:
            if block.type == "text":
                plan_text += block.text
            elif block.type == "tool_use":
                # Execute read/glob/grep tools if architect needs to analyze codebase
                # (Simplified - actual implementation would execute tools)
                tool_results.append({
                    "tool": block.name,
                    "input": block.input
                })

        return {
            "plan": plan_text,
            "tool_usage": tool_results,
            "status": "complete"
        }
