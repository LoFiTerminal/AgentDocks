"""Tester Agent - Writes and runs tests."""

from .base_agent import BaseAgent, AgentRole
from typing import Dict, Any, List


class TesterAgent(BaseAgent):
    """
    Tester Agent specializes in:
    - Writing comprehensive test suites
    - Running tests and reporting results
    - Finding edge cases
    - Regression testing
    - Performance testing
    """

    def __init__(self, agent_id: str, sandbox, provider, model: str):
        super().__init__(agent_id, AgentRole.TESTER, sandbox, provider, model)

    def get_system_prompt(self) -> str:
        return """You are a Senior QA Engineer specializing in automated testing.

Your responsibilities:
1. Write comprehensive test suites
2. Test happy paths and edge cases
3. Write unit tests, integration tests, and E2E tests
4. Run tests and report results clearly
5. Find bugs and report them to the Coder
6. Verify bug fixes with regression tests
7. Test error handling and boundary conditions

Testing principles:
- Test behavior, not implementation
- Write clear, descriptive test names
- Use AAA pattern (Arrange, Act, Assert)
- Test one thing per test
- Make tests independent
- Test edge cases and error conditions

Tools at your disposal:
- read: Read code to understand what to test
- write: Create test files
- edit: Update existing tests
- bash: Run test suites, check coverage
- glob: Find test files
- grep: Search for test patterns
- browser: Control headless browser for automated web testing (navigate, click, type, screenshot, extract, wait, execute, close)

Test frameworks you might use:
- Python: pytest, unittest
- JavaScript: Jest, Mocha, Vitest
- Go: testing package
- Rust: cargo test

Report format:
- Total tests run
- Passed / Failed / Skipped
- Coverage percentage
- Failed test details with error messages
- Suggestions for improvement
"""

    def get_available_tools(self) -> List[str]:
        """Tester needs read/write for tests and bash to run them."""
        return ["read", "write", "edit", "bash", "glob", "grep"]

    async def _execute_task(self, task: str) -> Dict[str, Any]:
        """
        Execute testing task.
        Writes tests, runs them, reports results.
        """
        # Get implementation details from shared context
        files_modified = self.context.get("files_modified", [])
        
        messages = [
            {
                "role": "user",
                "content": f"""Task: {task}

Files that were modified: {files_modified}

Your job:
1. Read the implementation
2. Write comprehensive tests
3. Run the tests
4. Report results

Include:
- Unit tests for individual functions
- Integration tests if needed
- Edge cases and error conditions
- Clear test output

Context:
{self.context}
"""
            }
        ]

        # Call AI provider
        from core.tools import TOOLS
        print(f"🤖 {self.agent_id} calling AI provider with model: {self.model}")
        try:
            response = await self.provider.complete(
                messages=messages,
                tools=[tool for tool in TOOLS if tool["name"] in self.get_available_tools()],
                model=self.model,
                system=self.get_system_prompt()
            )
            print(f"✅ {self.agent_id} received response with {len(response.content)} blocks")
        except Exception as e:
            print(f"❌ {self.agent_id} AI provider error: {e}")
            raise

        # Parse test results
        test_output = []
        test_files_created = []
        tests_passed = 0
        tests_failed = 0
        
        for block in response.content:
            if block.type == "text":
                test_output.append(block.text)
                # Try to parse test results from text
                if "passed" in block.text.lower():
                    # Simple parsing - could be more sophisticated
                    pass
            elif block.type == "tool_use":
                if block.name == "write" and "test" in block.input.get("path", ""):
                    test_files_created.append(block.input["path"])

        return {
            "test_report": "\n".join(test_output),
            "test_files": test_files_created,
            "tests_passed": tests_passed,
            "tests_failed": tests_failed,
            "status": "complete"
        }
