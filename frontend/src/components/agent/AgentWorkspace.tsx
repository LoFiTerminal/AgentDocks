'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Code, TestTube, Eye, Loader2, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface AgentStatus {
  id: string;
  name: string;
  role: 'architect' | 'coder' | 'tester' | 'reviewer';
  status: 'waiting' | 'working' | 'complete' | 'idle';
  output: string[];
  startTime?: number;
  endTime?: number;
}

interface AgentWorkspaceProps {
  agents: AgentStatus[];
  onAgentUpdate?: (agentId: string, output: string) => void;
}

const AGENT_ICONS = {
  architect: Lightbulb,
  coder: Code,
  tester: TestTube,
  reviewer: Eye,
};

const AGENT_COLORS = {
  architect: 'blue',
  coder: 'amber',
  tester: 'green',
  reviewer: 'purple',
};

export function AgentWorkspace({ agents }: AgentWorkspaceProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {agents.map((agent) => {
        const Icon = AGENT_ICONS[agent.role];
        const color = AGENT_COLORS[agent.role];

        return (
          <div
            key={agent.id}
            className={clsx(
              'border rounded-lg overflow-hidden transition-all',
              agent.status === 'working' && 'ring-2',
              color === 'blue' && 'border-blue-500/30 ring-blue-500/50',
              color === 'amber' && 'border-amber-500/30 ring-amber-500/50',
              color === 'green' && 'border-green-500/30 ring-green-500/50',
              color === 'purple' && 'border-purple-500/30 ring-purple-500/50'
            )}
          >
            {/* Agent Header */}
            <div
              className={clsx(
                'px-4 py-3 flex items-center justify-between',
                color === 'blue' && 'bg-blue-500/10',
                color === 'amber' && 'bg-amber-500/10',
                color === 'green' && 'bg-green-500/10',
                color === 'purple' && 'bg-purple-500/10'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={clsx(
                    'w-5 h-5',
                    color === 'blue' && 'text-blue-400',
                    color === 'amber' && 'text-amber-400',
                    color === 'green' && 'text-green-400',
                    color === 'purple' && 'text-purple-400'
                  )}
                />
                <span className="font-semibold text-sm">{agent.name}</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {agent.status === 'waiting' && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Waiting</span>
                  </div>
                )}
                {agent.status === 'working' && (
                  <div className="flex items-center gap-1 text-xs text-amber-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Working</span>
                  </div>
                )}
                {agent.status === 'complete' && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Done</span>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Output */}
            <div className="p-4 bg-secondary/5 min-h-[200px] max-h-[300px] overflow-y-auto">
              {agent.output.length === 0 && agent.status === 'idle' && (
                <div className="text-xs text-muted-foreground italic">
                  Agent not started yet...
                </div>
              )}
              {agent.output.length === 0 && agent.status === 'waiting' && (
                <div className="text-xs text-muted-foreground italic">
                  Waiting for previous agents to complete...
                </div>
              )}
              {agent.output.length === 0 && agent.status === 'working' && (
                <div className="text-xs text-muted-foreground italic flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Initializing...
                </div>
              )}
              {agent.output.length > 0 && (
                <div className="space-y-2">
                  {agent.output.map((line, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono text-foreground/80 animate-fade-in"
                    >
                      {line}
                    </div>
                  ))}
                  {agent.status === 'working' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Agent Footer with timing */}
            {(agent.startTime || agent.endTime) && (
              <div className="px-4 py-2 bg-secondary/10 border-t border-border text-xs text-muted-foreground">
                {agent.endTime && agent.startTime && (
                  <span>
                    Completed in {((agent.endTime - agent.startTime) / 1000).toFixed(1)}s
                  </span>
                )}
                {!agent.endTime && agent.startTime && (
                  <span>
                    Running for {((Date.now() - agent.startTime) / 1000).toFixed(0)}s...
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
