'use client';

import { motion } from 'framer-motion';
import {
  Cpu,
  Sparkles,
  Code2,
  TestTube,
  Eye,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface AgentCardProps {
  agent: {
    agent_id: string;
    role: string;
    status: 'idle' | 'thinking' | 'working' | 'waiting' | 'done' | 'error';
    current_task?: string;
    progress?: string;
  };
}

const roleIcons = {
  orchestrator: Cpu,
  architect: Sparkles,
  coder: Code2,
  tester: TestTube,
  reviewer: Eye,
};

const roleColors = {
  orchestrator: 'text-purple-400',
  architect: 'text-blue-400',
  coder: 'text-green-400',
  tester: 'text-yellow-400',
  reviewer: 'text-pink-400',
};

const roleBgColors = {
  orchestrator: 'bg-purple-500/10',
  architect: 'bg-blue-500/10',
  coder: 'bg-green-500/10',
  tester: 'bg-yellow-500/10',
  reviewer: 'bg-pink-500/10',
};

const statusIcons = {
  idle: Clock,
  thinking: Loader2,
  working: Loader2,
  waiting: Clock,
  done: CheckCircle2,
  error: XCircle,
};

const statusColors = {
  idle: 'text-muted-foreground',
  thinking: 'text-blue-400',
  working: 'text-amber-400',
  waiting: 'text-yellow-400',
  done: 'text-green-400',
  error: 'text-red-400',
};

export function AgentCard({ agent }: AgentCardProps) {
  const RoleIcon = roleIcons[agent.role as keyof typeof roleIcons] || Cpu;
  const StatusIcon = statusIcons[agent.status];
  const roleColor = roleColors[agent.role as keyof typeof roleColors] || 'text-foreground';
  const roleBgColor = roleBgColors[agent.role as keyof typeof roleBgColors] || 'bg-secondary';
  const statusColor = statusColors[agent.status];

  const isAnimating = agent.status === 'thinking' || agent.status === 'working';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        border border-border rounded-lg p-2
        ${roleBgColor}
        hover:border-amber-500/30 transition-colors
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <RoleIcon className={`w-4 h-4 ${roleColor}`} />
          <span className="text-xs font-medium capitalize">
            {agent.role}
          </span>
        </div>

        <StatusIcon
          className={`
            w-3 h-3 ${statusColor}
            ${isAnimating ? 'animate-spin' : ''}
          `}
        />
      </div>

      {/* Status Badge */}
      <div className="mb-1">
        <span className={`
          inline-block px-1.5 py-0.5 text-xs rounded-full
          ${statusColor} bg-background/50
        `}>
          {agent.status}
        </span>
      </div>

      {/* Agent ID (subtle) */}
      <div className="text-xs text-muted-foreground/50 font-mono">
        {agent.agent_id}
      </div>
    </motion.div>
  );
}
