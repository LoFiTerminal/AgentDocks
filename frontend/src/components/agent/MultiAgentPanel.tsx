'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Users, MessageSquare } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'agents' | 'messages'>('agents');

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
    setIsRunning(true);

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

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const event = JSON.parse(line.slice(6));
            console.log('Multi-agent event:', event);

            if (event.type === 'done' || event.type === 'error') {
              setIsRunning(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to run workflow:', err);
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
        className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-2xl font-bold">Multi-Agent System</h2>
              <p className="text-sm text-muted-foreground">
                Coordinate specialized agents to complete complex tasks
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
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel: Workflow Selector */}
          <div className="w-1/3 border-r border-border p-6 overflow-y-auto">
            <WorkflowSelector
              workflows={workflows}
              onRunWorkflow={handleRunWorkflow}
              isRunning={isRunning}
            />
          </div>

          {/* Right Panel: Agents & Messages */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('agents')}
                className={`
                  flex items-center gap-2 px-6 py-4 border-b-2 transition-colors
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
                  flex items-center gap-2 px-6 py-4 border-b-2 transition-colors
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
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
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
                ) : (
                  <motion.div
                    key="messages"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MessageTimeline messages={messages} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
