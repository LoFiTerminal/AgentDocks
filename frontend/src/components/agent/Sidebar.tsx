'use client';

import { Logo } from '@/components/Logo';
import { Plus, Settings, Clock, Grid3x3, BookOpen, Folder, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  tasks: Task[];
  onNewTask: () => void;
  onOpenProject: () => void;
  onOpenMultiAgent: () => void;
  hasProject: boolean;
  currentConfig: {
    provider: string;
    model: string;
    sandbox: string;
  } | null;
}

export const Sidebar = ({ tasks, onNewTask, onOpenProject, onOpenMultiAgent, hasProject, currentConfig }: SidebarProps) => {
  const router = useRouter();

  return (
    <div className="w-64 h-screen bg-secondary/20 border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Logo size={32} className="logo-glow" />
          <div>
            <div className="font-bold text-sm">AgentDocks.ai</div>
            <div className="text-xs text-muted-foreground">Agent Engine</div>
          </div>
        </div>
      </div>

      {/* New Task Button */}
      <div className="p-4">
        <button
          onClick={onNewTask}
          className="w-full px-4 py-3 bg-[#F59E0B] text-[#1C1917] rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#D97706] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Navigation Links */}
      <div className="px-4 space-y-2">
        <button
          onClick={() => router.push('/templates')}
          className="w-full px-4 py-2 rounded-lg text-sm flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
        >
          <Grid3x3 className="w-4 h-4 text-muted-foreground" />
          <span>Templates</span>
        </button>
        <button
          onClick={onOpenMultiAgent}
          className="w-full px-4 py-2 rounded-lg text-sm flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left bg-amber-500/10 border border-amber-500/20"
        >
          <Users className="w-4 h-4 text-amber-500" />
          <span className="text-amber-500 font-medium">Multi-Agent</span>
          <span className="ml-auto text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">New</span>
        </button>
        <button
          onClick={() => router.push('/recipes')}
          className="w-full px-4 py-2 rounded-lg text-sm flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left opacity-50 cursor-not-allowed"
          disabled
        >
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span>Recipes</span>
          <span className="ml-auto text-xs text-muted-foreground">Soon</span>
        </button>
        <button
          onClick={onOpenProject}
          className="w-full px-4 py-2 rounded-lg text-sm flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
        >
          <Folder className="w-4 h-4 text-muted-foreground" />
          <span>My Project</span>
          {hasProject && (
            <span className="ml-auto w-2 h-2 rounded-full bg-[#F59E0B]" />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 my-2 border-t border-border" />

      {/* Task History */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Tasks
        </div>
        {tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No tasks yet
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <button
                key={task.id}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate group-hover:text-[#F59E0B] transition-colors">
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(task.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        {currentConfig && (
          <div className="mb-3 p-3 rounded-lg bg-secondary/30 text-xs space-y-1">
            <div>
              <span className="text-muted-foreground">Model:</span>{' '}
              <span className="text-[#F59E0B] font-mono">{currentConfig.model.split('/').pop()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sandbox:</span>{' '}
              <span className="text-[#F59E0B] font-mono">{currentConfig.sandbox}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => router.push('/onboarding')}
          className="w-full px-4 py-2 border border-border rounded-lg text-sm flex items-center justify-center gap-2 hover:border-[#F59E0B] hover:bg-secondary/50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
};
