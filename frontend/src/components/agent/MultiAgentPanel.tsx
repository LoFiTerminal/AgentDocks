'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { MessageTimeline } from './MessageTimeline';
import { WorkflowSelector } from './WorkflowSelector';

interface MultiAgentPanelProps {
  onClose: () => void;
}

interface Agent {
  agent_id: string;
  role: string;
  status: 'idle' | 'thinking' | 'working' | 'waiting' | 'done' | 'error';
  current_task?: string;
  progress?: string;
}

interface Message {
  from_agent: string;
  to_agent: string;
  message_type: string;
  content: any;
  timestamp: string;
}

interface WorkflowOption {
  id: string;
  name: string;
  description: string;
  agents: string[];
}

export function MultiAgentPanel({ onClose }: MultiAgentPanelProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'messages' | 'results'>('agents');
  const [workflowResult, setWorkflowResult] = useState<any>(null);

  // Load available workflows
  useEffect(() => {
    fetch('/api/multi-agent/workflows')
      .then(res => res.json())
      .then(data => setWorkflows(data.workflows || []))
      .catch(err => console.error('Failed to load workflows:', err));
  }, []);

  // Poll for agent status and messages
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        // Get agent status
        const statusRes = await fetch('/api/multi-agent/status');
        const statusData = await statusRes.json();
        setAgents(statusData.agents || []);

        // Get messages
        const messagesRes = await fetch('/api/multi-agent/messages');
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);

        // Check if any agents are actively working
        const hasActiveAgents = statusData.agents?.some(
          (agent: Agent) => agent.status === 'working' || agent.status === 'thinking'
        );
        setIsRunning(hasActiveAgents);
      } catch (err) {
        console.error('Failed to poll multi-agent status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleRunWorkflow = async (workflowId: string, task: string) => {
    if (isRunning) {
      console.log('Workflow already running, ignoring duplicate trigger');
      return;
    }

    // Reset system before starting new workflow
    try {
      await fetch('/api/multi-agent/reset', { method: 'POST' });
      setAgents([]);
      setMessages([]);
    } catch (err) {
      console.error('Failed to reset:', err);
    }

    setIsRunning(true);
    console.log('Starting workflow:', workflowId, task);

    // Safety timeout - reset after 2 minutes
    const timeout = setTimeout(() => {
      console.log('Workflow timeout - resetting');
      setIsRunning(false);
    }, 120000);

    try {
      const response = await fetch('/api/multi-agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          workflow: workflowId,
        }),
      });

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        clearTimeout(timeout);
        setIsRunning(false);
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              console.log('Multi-agent event:', event);

              if (event.type === 'result') {
                console.log('Workflow result:', event.data);
                setWorkflowResult(event.data);
              }

              if (event.type === 'done' || event.type === 'error') {
                clearTimeout(timeout);
                setIsRunning(false);
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
      }

      clearTimeout(timeout);
      setIsRunning(false);
    } catch (err) {
      console.error('Failed to run workflow:', err);
      clearTimeout(timeout);
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/multi-agent/reset', { method: 'POST' });
      setAgents([]);
      setMessages([]);
      setIsRunning(false);
    } catch (err) {
      console.error('Failed to reset multi-agent system:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background border border-border rounded-xl shadow-2xl w-[90vw] max-w-4xl h-[75vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <div>
              <h2 className="text-base font-bold">Multi-Agent System</h2>
              <p className="text-xs text-muted-foreground">
                4 specialized agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Reset System"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Panel: Workflow Selector */}
          <div className="w-72 border-r border-border p-2 overflow-y-auto flex-shrink-0">
            <WorkflowSelector
              workflows={workflows}
              onRunWorkflow={handleRunWorkflow}
              isRunning={isRunning}
            />
          </div>

          {/* Right Panel: Agents & Messages */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border flex-shrink-0 text-sm">
              <button
                onClick={() => setActiveTab('agents')}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                  ${
                    activeTab === 'agents'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Users className="w-4 h-4" />
                Agents ({agents.length})
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                  ${
                    activeTab === 'messages'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4" />
                Messages ({messages.length})
              </button>
              {workflowResult && (
                <button
                  onClick={() => setActiveTab('results')}
                  className={`
                    flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                    ${
                      activeTab === 'results'
                        ? 'border-amber-500 text-amber-500'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Results
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-2 overflow-y-auto min-h-0">
              <AnimatePresence mode="wait">
                {activeTab === 'agents' ? (
                  <motion.div
                    key="agents"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {agents.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {agents.map(agent => (
                          <AgentCard key={agent.agent_id} agent={agent} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Active Agents</p>
                        <p className="text-sm">
                          Start a workflow to see agents in action
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : activeTab === 'messages' ? (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MessageTimeline messages={messages} />
                  </motion.div>
                ) : activeTab === 'results' && workflowResult ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-5 h-5 ${
                            workflowResult.final_decision === 'APPROVED' ? 'text-green-400' :
                            workflowResult.final_decision === 'REJECTED' ? 'text-red-400' :
                            'text-yellow-400'
                          }`} />
                          <span className="font-semibold">Decision: {workflowResult.final_decision}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Task: {workflowResult.task}
                      </p>
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 text-xs">
                        <strong>💡 How to use this code:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Copy the code below from the &quot;Coder&quot; section</li>
                          <li>Paste it into your project (e.g., calculator.js)</li>
                          <li>Run it in your environment (Node.js, browser console, etc.)</li>
                        </ol>
                      </div>
                    </div>

                    {workflowResult.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="border border-border rounded-lg p-3">
                        <div className="font-medium text-sm mb-2 capitalize">
                          {step.agent}
                        </div>

                        {/* Show implementation from coder */}
                        {step.result?.implementation && (
                          <div className="mb-2">
                            <div className="text-xs font-medium mb-1">Code:</div>
                            <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto max-h-60 overflow-y-auto">
                              {step.result.implementation}
                            </pre>
                          </div>
                        )}

                        {/* Show plan from architect */}
                        {step.result?.plan && (
                          <div className="mb-2">
                            <div className="text-xs font-medium mb-1">Plan:</div>
                            <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                              {step.result.plan}
                            </pre>
                          </div>
                        )}

                        {/* Show test report */}
                        {step.result?.test_report && (
                          <div className="mb-2">
                            <div className="text-xs font-medium mb-1">Tests:</div>
                            <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                              {step.result.test_report}
                            </pre>
                          </div>
                        )}

                        {/* Show review */}
                        {step.result?.review && (
                          <div className="mb-2">
                            <div className="text-xs font-medium mb-1">Review:</div>
                            <div className="text-xs text-muted-foreground max-h-40 overflow-y-auto whitespace-pre-wrap">
                              {step.result.review}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground/50 mt-2">
                          Status: {step.result?.status || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
