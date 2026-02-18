'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAgent } from '@/hooks/useAgent';
import { Sidebar } from '@/components/agent/Sidebar';
import { AgentConsole } from '@/components/agent/AgentConsole';
import { InputBar } from '@/components/agent/InputBar';
import { PrivacyIndicator } from '@/components/PrivacyIndicator';
import { ShareModal } from '@/components/agent/ShareModal';
import { ProjectModal } from '@/components/agent/ProjectModal';
import { DiffPanel } from '@/components/agent/DiffPanel';
import { AgentWorkspace } from '@/components/agent/AgentWorkspace';
import { TEMPLATES } from '@/lib/templates';
import { InstallInstructions } from '@/components/InstallInstructions';

interface Task {
  id: string;
  title: string;
  timestamp: number;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { messages, isRunning, runAgent, stopAgent, clearMessages } = useAgent();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [initialQuery, setInitialQuery] = useState<string>('');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLocalhost, setIsLocalhost] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDiffPanel, setShowDiffPanel] = useState(false);
  const [projectChanges, setProjectChanges] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [multiAgentMode, setMultiAgentMode] = useState(false);
  const [agentStates, setAgentStates] = useState([
    { id: 'architect', name: 'Architect', role: 'architect' as const, status: 'idle' as const, output: [] },
    { id: 'coder', name: 'Coder', role: 'coder' as const, status: 'idle' as const, output: [] },
    { id: 'tester', name: 'Tester', role: 'tester' as const, status: 'idle' as const, output: [] },
    { id: 'reviewer', name: 'Reviewer', role: 'reviewer' as const, status: 'idle' as const, output: [] },
  ]);

  // Check if running on localhost
  useEffect(() => {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    setIsLocalhost(isLocal);
  }, []);

  // Load config and check for template param on mount
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setCurrentConfig(data))
      .catch(err => console.error('Failed to load config:', err));

    // Check if a template was passed
    const templateId = searchParams?.get('template');
    if (templateId) {
      const template = TEMPLATES.find(t => t.id === templateId);
      if (template) {
        setInitialQuery(template.prompt);
      }
    }

    // Load recent projects
    fetch('/api/project/recent')
      .then(res => res.json())
      .then(data => setRecentProjects(data.recent_projects || []))
      .catch(err => console.error('Failed to load recent projects:', err));
  }, [searchParams]);

  // Update agent states based on messages (multi-agent mode)
  useEffect(() => {
    if (!multiAgentMode) return;

    // Process all status messages to update agent states
    messages.forEach((message, idx) => {
      if (message.type !== 'status') return;

      const statusText = (message.data as any).message || '';

      // Update agent states based on status text
      setAgentStates(prev => {
        let updated: any[] = [...prev];

        if (statusText.includes('Step 1/4') || statusText.includes('Architect is analyzing')) {
          updated = updated.map(a =>
            a.id === 'architect'
              ? { ...a, status: 'working' as const, output: [...new Set([...a.output, statusText])], startTime: a.startTime || Date.now() }
              : a.id === 'coder' ? { ...a, status: 'waiting' as const }
              : a.id === 'tester' ? { ...a, status: 'waiting' as const }
              : a.id === 'reviewer' ? { ...a, status: 'waiting' as const }
              : a
          );
        } else if (statusText.includes('Architecture plan created') || statusText.includes('✓ Architecture')) {
          updated = updated.map(a =>
            a.id === 'architect' ? { ...a, status: 'complete' as const, output: [...new Set([...a.output, '✅ Plan complete'])], endTime: Date.now() } : a
          );
        } else if (statusText.includes('Step 2/4') || statusText.includes('Coder is writing')) {
          updated = updated.map(a =>
            a.id === 'coder' ? { ...a, status: 'working' as const, output: [...new Set([...a.output, statusText])], startTime: a.startTime || Date.now() } : a
          );
        } else if (statusText.includes('Code implementation complete') || statusText.includes('✓ Code')) {
          updated = updated.map(a =>
            a.id === 'coder' ? { ...a, status: 'complete' as const, output: [...new Set([...a.output, '✅ Code written'])], endTime: Date.now() } : a
          );
        } else if (statusText.includes('Step 3/4') || statusText.includes('Tester is running')) {
          updated = updated.map(a =>
            a.id === 'tester' ? { ...a, status: 'working' as const, output: [...new Set([...a.output, statusText])], startTime: a.startTime || Date.now() } : a
          );
        } else if (statusText.includes('Tests completed') || statusText.includes('✓ Tests')) {
          updated = updated.map(a =>
            a.id === 'tester' ? { ...a, status: 'complete' as const, output: [...new Set([...a.output, '✅ Tests done'])], endTime: Date.now() } : a
          );
        } else if (statusText.includes('Step 4/4') || statusText.includes('Reviewer is evaluating')) {
          updated = updated.map(a =>
            a.id === 'reviewer' ? { ...a, status: 'working' as const, output: [...new Set([...a.output, statusText])], startTime: a.startTime || Date.now() } : a
          );
        } else if (statusText.includes('Workflow complete')) {
          updated = updated.map(a =>
            a.id === 'reviewer' ? { ...a, status: 'complete' as const, output: [...new Set([...a.output, '✅ Review complete'])], endTime: Date.now() } : a
          );
        }

        return updated;
      });
    });
  }, [messages, multiAgentMode]);

  const handleSubmit = async (query: string, files?: File[], multiAgent?: boolean) => {
    // Add to task history
    const task: Task = {
      id: Date.now().toString(),
      title: query.slice(0, 50) + (query.length > 50 ? '...' : ''),
      timestamp: Date.now(),
    };
    setTasks(prev => [task, ...prev].slice(0, 10)); // Keep last 10 tasks

    // Track query and start time
    setCurrentQuery(query);
    setStartTime(Date.now());

    // Reset agent states if multi-agent mode
    if (multiAgent) {
      setAgentStates([
        { id: 'architect', name: 'Architect', role: 'architect', status: 'idle', output: [] },
        { id: 'coder', name: 'Coder', role: 'coder', status: 'idle', output: [] },
        { id: 'tester', name: 'Tester', role: 'tester', status: 'idle', output: [] },
        { id: 'reviewer', name: 'Reviewer', role: 'reviewer', status: 'idle', output: [] },
      ]);
    }

    // Run agent (single or multi-agent mode)
    await runAgent(query, files, multiAgent);
  };

  const handleShareRun = async () => {
    if (!messages.length || !currentQuery) return;

    // Calculate stats
    const duration = (Date.now() - startTime) / 1000;
    const toolCount = messages.filter(m => m.type === 'tool_use').length;

    try {
      const response = await fetch('/api/runs/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          query: currentQuery,
          model: currentConfig?.model || 'unknown',
          duration_seconds: duration,
          tool_count: toolCount,
        }),
      });

      const data = await response.json();
      setShareUrl(data.url);
      setShowShareModal(true);
    } catch (err) {
      console.error('Failed to share run:', err);
    }
  };

  const handleNewTask = () => {
    clearMessages();
  };

  const handleExampleClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  const handleProjectSelected = async (path: string) => {
    setShowProjectModal(false);
    // Reload config to get updated current_project
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      setCurrentConfig(config);

      // Reload recent projects
      const recentRes = await fetch('/api/project/recent');
      const recentData = await recentRes.json();
      setRecentProjects(recentData.recent_projects || []);
    } catch (err) {
      console.error('Failed to reload config:', err);
    }
  };

  const handleApplyChanges = async (paths: string[]) => {
    try {
      const response = await fetch('/api/project/apply-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved_changes: paths,
          create_backup: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Changes applied:', result);
        setShowDiffPanel(false);
        setProjectChanges([]);
        // Could show success notification here
      }
    } catch (err) {
      console.error('Failed to apply changes:', err);
    }
  };

  // If not localhost, show install instructions
  if (!isLocalhost) {
    return <InstallInstructions />;
  }

  // Check if fully local
  const isFullyLocal = currentConfig?.provider === 'ollama' && currentConfig?.sandbox === 'docker';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="animate-slide-in-left">
        <Sidebar
          tasks={tasks}
          onNewTask={handleNewTask}
          onOpenProject={() => setShowProjectModal(true)}
          hasProject={!!currentConfig?.current_project}
          currentConfig={currentConfig}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col animate-page-enter">
        {/* Privacy indicator */}
        {currentConfig && (
          <div className="absolute top-4 right-4 z-10">
            <PrivacyIndicator isFullyLocal={isFullyLocal} />
          </div>
        )}

        {/* Console or Agent Workspace */}
        {multiAgentMode && (isRunning || agentStates.some(a => a.status !== 'idle')) ? (
          <div className="flex-1 overflow-y-auto">
            <AgentWorkspace agents={agentStates} />
            {/* Show results below workspace when complete */}
            {!isRunning && messages.some(m => m.type === 'result') && (
              <div className="border-t border-border">
                <AgentConsole
                  messages={messages.filter(m => m.type === 'result' || m.type === 'done')}
                  onExampleClick={handleExampleClick}
                  onShare={handleShareRun}
                  canShare={true}
                  isRunning={false}
                />
              </div>
            )}
          </div>
        ) : (
          <AgentConsole
            messages={messages}
            onExampleClick={handleExampleClick}
            onShare={handleShareRun}
            canShare={messages.some(m => m.type === 'done') && !isRunning}
            isRunning={isRunning}
          />
        )}

        {/* Input bar */}
        <InputBar
          onSubmit={handleSubmit}
          isRunning={isRunning}
          onStop={stopAgent}
          initialQuery={initialQuery}
          multiAgentMode={multiAgentMode}
          onMultiAgentToggle={setMultiAgentMode}
        />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onProjectSelected={handleProjectSelected}
          recentProjects={recentProjects}
        />
      )}

      {/* Diff Panel */}
      {showDiffPanel && (
        <DiffPanel
          changes={projectChanges}
          onApprove={handleApplyChanges}
          onReject={() => {
            setShowDiffPanel(false);
            setProjectChanges([]);
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
