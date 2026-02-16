'use client';

import { useState } from 'react';
import { X, Folder, AlertCircle, Check, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface RecentProject {
  path: string;
  name: string;
  last_opened: string;
  project_type?: string;
  file_count?: number;
  size_mb?: number;
}

interface ProjectModalProps {
  onClose: () => void;
  onProjectSelected: (path: string) => void;
  recentProjects: RecentProject[];
}

export const ProjectModal = ({
  onClose,
  onProjectSelected,
  recentProjects
}: ProjectModalProps) => {
  const [customPath, setCustomPath] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openProject = async (path: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/project/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_path: path })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to open project');
      }

      onProjectSelected(path);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPath.trim()) {
      openProject(customPath.trim());
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-secondary border-2 border-[#F59E0B]/30 rounded-2xl shadow-2xl scale-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Open Project</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a folder to work on (max 500MB, 10k files)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            </div>
          )}

          {/* Path input */}
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-2">Project Path</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="/Users/you/my-project"
                disabled={loading}
                className={clsx(
                  'flex-1 px-4 py-3 rounded-lg',
                  'bg-secondary border-2 border-border',
                  'text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:border-[#F59E0B]',
                  'transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
              <button
                type="submit"
                disabled={loading || !customPath.trim()}
                className={clsx(
                  'px-6 py-3 bg-[#F59E0B] text-[#1C1917] rounded-lg font-semibold',
                  'hover:bg-[#D97706] transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loading ? 'Opening...' : 'Open'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Paste the absolute path to your project folder
            </p>
          </form>

          {/* Recent projects */}
          {recentProjects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Recent Projects
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentProjects.map((project) => (
                  <button
                    key={project.path}
                    onClick={() => openProject(project.path)}
                    disabled={loading}
                    className={clsx(
                      'w-full p-4 rounded-lg bg-secondary/50 border border-border',
                      'hover:border-[#F59E0B] hover:bg-secondary transition-all',
                      'text-left disabled:opacity-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Folder className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                          <span className="font-semibold truncate">{project.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate mb-2">
                          {project.path}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {project.project_type && (
                            <span className="px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] font-medium">
                              {project.project_type}
                            </span>
                          )}
                          {project.file_count && (
                            <span>{project.file_count} files</span>
                          )}
                          {project.size_mb && (
                            <span>{project.size_mb} MB</span>
                          )}
                          <span className="flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            {formatDate(project.last_opened)}
                          </span>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security note */}
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Security:</strong> Your project will be copied to a sandbox.
              Changes require your approval before being written back.
              Respects .gitignore patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
