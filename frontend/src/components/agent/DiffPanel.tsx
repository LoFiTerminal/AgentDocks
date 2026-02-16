'use client';

import { useState } from 'react';
import { Check, X, FileText, FilePlus, FileX, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface FileChange {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  original_content?: string;
  new_content?: string;
  diff?: string;
}

interface DiffPanelProps {
  changes: FileChange[];
  onApprove: (paths: string[]) => Promise<void>;
  onReject: () => void;
}

export const DiffPanel = ({ changes, onApprove, onReject }: DiffPanelProps) => {
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(
    new Set(changes.map(c => c.path))
  );
  const [loading, setLoading] = useState(false);

  const toggleChange = (path: string) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedChanges(newSelected);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(Array.from(selectedChanges));
    } finally {
      setLoading(false);
    }
  };

  const createdCount = changes.filter(c => c.type === 'created').length;
  const modifiedCount = changes.filter(c => c.type === 'modified').length;
  const deletedCount = changes.filter(c => c.type === 'deleted').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] bg-secondary border-2 border-[#F59E0B]/30 rounded-2xl shadow-2xl flex flex-col scale-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Review Changes</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedChanges.size} of {changes.length} changes selected
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <FilePlus className="w-4 h-4 text-green-500" />
                <span className="font-semibold">{createdCount}</span>
              </span>
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{modifiedCount}</span>
              </span>
              <span className="flex items-center gap-2">
                <FileX className="w-4 h-4 text-red-500" />
                <span className="font-semibold">{deletedCount}</span>
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-500">
              A backup will be created at ~/.agentdocks/backups/ before applying changes
            </p>
          </div>
        </div>

        {/* Changes list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {changes.map((change) => (
            <ChangeItem
              key={change.path}
              change={change}
              selected={selectedChanges.has(change.path)}
              onToggle={() => toggleChange(change.path)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onReject}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 font-semibold"
          >
            Reject All
          </button>
          <button
            onClick={handleApprove}
            disabled={loading || selectedChanges.size === 0}
            className={clsx(
              'flex-1 px-4 py-3 bg-[#F59E0B] text-[#1C1917] rounded-lg font-semibold',
              'hover:bg-[#D97706] transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading ? 'Applying...' : `Apply ${selectedChanges.size} Change${selectedChanges.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChangeItemProps {
  change: FileChange;
  selected: boolean;
  onToggle: () => void;
}

const ChangeItem = ({ change, selected, onToggle }: ChangeItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const icon = change.type === 'created' ? FilePlus :
                change.type === 'deleted' ? FileX : FileText;
  const iconColor = change.type === 'created' ? 'text-green-500' :
                     change.type === 'deleted' ? 'text-red-500' : 'text-blue-500';
  const bgColor = change.type === 'created' ? 'bg-green-500/5 border-green-500/20' :
                   change.type === 'deleted' ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-500/5 border-blue-500/20';

  const Icon = icon;

  return (
    <div className={clsx(
      'rounded-lg border transition-all',
      selected ? 'border-[#F59E0B] bg-[#F59E0B]/5' : `border-border ${bgColor}`
    )}>
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 cursor-pointer"
        />
        <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm truncate font-semibold">{change.path}</div>
          <div className="text-xs text-muted-foreground mt-1 capitalize flex items-center gap-2">
            <span>{change.type}</span>
            {change.type === 'modified' && change.diff && (
              <span className="text-muted-foreground">
                • {change.diff.split('\n').filter(l => l.startsWith('+')).length} additions,{' '}
                {change.diff.split('\n').filter(l => l.startsWith('-')).length} deletions
              </span>
            )}
          </div>
        </div>
        {(change.diff || change.new_content) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#F59E0B] hover:underline flex-shrink-0"
          >
            {expanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                View
              </>
            )}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border p-4 bg-background/50">
          {change.type === 'modified' && change.diff ? (
            <DiffViewer diff={change.diff} />
          ) : change.type === 'created' && change.new_content ? (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">NEW FILE CONTENT:</div>
              <pre className="text-xs font-mono overflow-x-auto p-3 bg-background rounded border border-border max-h-96 overflow-y-auto">
                {change.new_content}
              </pre>
            </div>
          ) : change.type === 'deleted' && change.original_content ? (
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">DELETED FILE CONTENT:</div>
              <pre className="text-xs font-mono overflow-x-auto p-3 bg-background rounded border border-border max-h-96 overflow-y-auto text-red-500/70">
                {change.original_content}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const DiffViewer = ({ diff }: { diff: string }) => {
  const lines = diff.split('\n');

  return (
    <div className="text-xs font-mono overflow-x-auto bg-background rounded border border-border max-h-96 overflow-y-auto">
      {lines.map((line, i) => {
        let className = 'px-3 py-0.5';
        if (line.startsWith('+')) {
          className += ' bg-green-500/10 text-green-500';
        } else if (line.startsWith('-')) {
          className += ' bg-red-500/10 text-red-500';
        } else if (line.startsWith('@@')) {
          className += ' bg-blue-500/10 text-blue-500 font-semibold';
        } else {
          className += ' text-muted-foreground';
        }

        return (
          <div key={i} className={className}>
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
};
