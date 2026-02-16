"""Orchestrator - Coordinates multi-agent workflows."""

from typing import Dict, Any, List
from .agents.base_agent import AgentRole, AgentStatus
from .agents.architect_agent import ArchitectAgent
from .agents.coder_agent import CoderAgent
from .agents.tester_agent import TesterAgent
from .agents.reviewer_agent import ReviewerAgent
from .communication.message_bus import MessageBus
from .communication.shared_context import SharedContext


class Orchestrator:
    """
    Orchestrator coordinates multiple agents to complete complex tasks.
    
    Workflow:
    1. User submits task
    2. Orchestrator analyzes and creates workflow
    3. Spawns required agents
    4. Coordinates agent execution
    5. Manages communication between agents
    6. Aggregates and presents results
    """

    def __init__(self, sandbox, provider, model: str):
        self.sandbox = sandbox
        self.provider = provider
        self.model = model
        
        # Communication infrastructure
        self.message_bus = MessageBus()
        self.shared_context = SharedContext()
        
        # Active agents
        self.agents: Dict[str, Any] = {}
        self.agent_counter = 0

    def _create_agent(self, role: AgentRole):
        """Create a new agent instance."""
        self.agent_counter += 1
        agent_id = f"{role.value}_{self.agent_counter}"
        
        if role == AgentRole.ARCHITECT:
            agent = ArchitectAgent(agent_id, self.sandbox, self.provider, self.model)
        elif role == AgentRole.CODER:
            agent = CoderAgent(agent_id, self.sandbox, self.provider, self.model)
        elif role == AgentRole.TESTER:
            agent = TesterAgent(agent_id, self.sandbox, self.provider, self.model)
        elif role == AgentRole.REVIEWER:
            agent = ReviewerAgent(agent_id, self.sandbox, self.provider, self.model)
        else:
            raise ValueError(f"Unknown agent role: {role}")
        
        self.agents[agent_id] = agent
        self.message_bus.register_agent(agent)
        
        return agent

    async def execute_feature_workflow(
        self,
        task: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Execute feature development workflow:
        Architect → Coder → Tester → Reviewer
        """
        print(f"\n🎭 Starting Feature Workflow: {task}\n")

        results = {
            "task": task,
            "workflow": "feature_development",
            "steps": []
        }

        # Initialize sandbox if needed
        sandbox_initialized = False
        print(f"🏗️  Initializing sandbox...")
        if hasattr(self.sandbox, '__aenter__'):
            await self.sandbox.__aenter__()
            sandbox_initialized = True
            print(f"✅ Sandbox initialized successfully")
            # Ensure /workspace/ exists
            await self.sandbox.execute_bash("mkdir -p /workspace")
            print(f"📁 Workspace directory created")
        else:
            print(f"⚠️  Sandbox doesn't support async context manager")

        try:
            # Step 1: Architecture Planning
            print("📐 Step 1: Architecture Planning")
            architect = self._create_agent(AgentRole.ARCHITECT)
            arch_result = await architect.process_task(task, context or {})
            results["steps"].append({
                "agent": "architect",
                "result": arch_result
            })
            
            # Store plan in shared context
            if "plan" in arch_result:
                self.shared_context.set_plan(arch_result["plan"], architect.agent_id)
            
            # Step 2: Implementation
            print("\n👨‍💻 Step 2: Implementation")
            coder = self._create_agent(AgentRole.CODER)
            coder_context = {
                "plan": self.shared_context.get_plan(),
                **(context or {})
            }
            code_result = await coder.process_task(task, coder_context)
            results["steps"].append({
                "agent": "coder",
                "result": code_result
            })
            
            # Store files modified
            if "files_modified" in code_result:
                self.shared_context.set_files_to_modify(
                    code_result["files_modified"],
                    coder.agent_id
                )
            
            # Step 3: Testing
            print("\n🧪 Step 3: Testing")
            tester = self._create_agent(AgentRole.TESTER)
            test_context = {
                "plan": self.shared_context.get_plan(),
                "files_modified": self.shared_context.get_files_to_modify(),
                **(context or {})
            }
            test_result = await tester.process_task(
                f"Write and run tests for: {task}",
                test_context
            )
            results["steps"].append({
                "agent": "tester",
                "result": test_result
            })
            
            # Step 4: Code Review
            print("\n👀 Step 4: Code Review")
            reviewer = self._create_agent(AgentRole.REVIEWER)
            review_context = {
                "plan": self.shared_context.get_plan(),
                "files_modified": self.shared_context.get_files_to_modify(),
                "test_results": test_result,
                **(context or {})
            }
            review_result = await reviewer.process_task(
                f"Review implementation of: {task}",
                review_context
            )
            results["steps"].append({
                "agent": "reviewer",
                "result": review_result
            })
            
            # Final assessment
            decision = review_result.get("decision", "PENDING")
            results["final_decision"] = decision
            results["success"] = decision == "APPROVED"
            
            print(f"\n✨ Workflow Complete: {decision}")
            
        except Exception as e:
            results["error"] = str(e)
            results["success"] = False
            print(f"\n❌ Workflow Failed: {e}")
        finally:
            # Cleanup sandbox if we initialized it
            if sandbox_initialized and hasattr(self.sandbox, '__aexit__'):
                await self.sandbox.__aexit__(None, None, None)

        return results

    async def execute_debug_workflow(
        self,
        task: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Execute debug workflow:
        Coder (investigate) → Tester (reproduce) → Coder (fix) → Tester (verify)
        """
        print(f"\n🎭 Starting Debug Workflow: {task}\n")
        
        results = {
            "task": task,
            "workflow": "debug",
            "steps": []
        }
        
        # Debug workflow implementation
        # Similar structure to feature workflow but optimized for bug fixing
        
        return results

    def get_agent_statuses(self) -> List[Dict]:
        """Get status of all active agents for UI."""
        return [
            agent.get_status_info()
            for agent in self.agents.values()
        ]

    def get_message_history(self) -> List[Dict]:
        """Get inter-agent communication history."""
        return self.message_bus.get_message_history()

    def get_shared_data(self) -> Dict[str, Any]:
        """Get shared context data."""
        return self.shared_context.get_all()
