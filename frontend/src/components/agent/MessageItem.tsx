'use client';

import { AgentMessage } from '@/hooks/useAgent';
import { CheckCircle, AlertCircle, Terminal, FileText, Loader2, Lightbulb, Code, TestTube, Eye, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface MessageItemProps {
  message: AgentMessage;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const { type, data } = message;

  // State for result collapsible sections (must be at top level for React Hooks rules)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['implementation']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const downloadFile = (filename: string, content: string) => {
    console.log('📥 Downloading file:', filename, 'Size:', content.length, 'bytes');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Status event
  if (type === 'status') {
    const statusData = data as { message: string };
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground animate-fade-in">
        <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
        <span>{statusData.message}</span>
      </div>
    );
  }

  // Tool use event
  if (type === 'tool_use') {
    const toolData = data as { tool: string; input: unknown };
    return (
      <div className="animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Terminal className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-mono font-semibold">
                {toolData.tool}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
                {JSON.stringify(toolData.input, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tool result event
  if (type === 'tool_result') {
    const resultData = data as { is_error: boolean; result: unknown };
    const isError = resultData.is_error;
    return (
      <div className="animate-fade-in">
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              isError ? 'bg-red-500/10' : 'bg-green-500/10'
            )}
          >
            {isError ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="flex-1">
            <div
              className={clsx(
                'p-3 rounded-lg border',
                isError
                  ? 'bg-red-500/5 border-red-500/20'
                  : 'bg-secondary/50 border-border'
              )}
            >
              <pre className="text-xs font-mono overflow-x-auto">
                {typeof resultData.result === 'string'
                  ? resultData.result
                  : JSON.stringify(resultData.result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Text event (AI response or user message)
  if (type === 'text') {
    const textData = data as { content: string; isUser?: boolean };

    // User message - show on the right with different styling
    if (textData.isUser) {
      return (
        <div className="animate-fade-in flex justify-end">
          <div className="max-w-[80%] p-4 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30">
            <div className="text-sm font-semibold text-[#F59E0B] mb-1">You</div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {textData.content}
            </div>
          </div>
        </div>
      );
    }

    // AI response
    return (
      <div className="animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#F59E0B] text-lg">🤖</span>
          </div>
          <div className="flex-1 pt-1">
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {textData.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // File event
  if (type === 'file') {
    const fileData = data as { path: string; size: number };
    return (
      <div className="animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-400">
                    {fileData.path}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fileData.size} bytes
                  </div>
                </div>
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error event
  if (type === 'error') {
    const errorData = data as { message: string };
    return (
      <div className="animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-sm font-semibold text-red-400 mb-1">Error</div>
              <div className="text-sm text-red-300">{errorData.message}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-agent workflow result
  if (type === 'result') {
    const resultData = data as any;

    // Debug logging
    console.log('📊 Result data received:', {
      hasCodeFiles: !!resultData.code_files,
      codeFilesKeys: resultData.code_files ? Object.keys(resultData.code_files) : [],
      hasImplementation: !!resultData.implementation,
      implementationLength: resultData.implementation?.length || 0
    });

    return (
      <div className="animate-fade-in space-y-4">
        <div className="text-sm font-semibold text-[#F59E0B] mb-3">
          🤖 Multi-Agent Workflow Results
        </div>

        {/* Architect's Plan */}
        {resultData.plan && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('plan')}
              className="w-full px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3"
            >
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Architect's Plan</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {expandedSections.has('plan') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.has('plan') && (
              <div className="p-4 bg-secondary/10">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                  {resultData.plan}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Coder's Implementation */}
        {resultData.implementation && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('implementation')}
              className="w-full px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3"
            >
              <Code className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Coder's Implementation</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {expandedSections.has('implementation') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.has('implementation') && (
              <div className="p-4 bg-secondary/10">
                {/* Download Buttons for Generated Files */}
                {resultData.code_files && Object.keys(resultData.code_files).length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {Object.entries(resultData.code_files).map(([filename, content]: [string, any]) => (
                      <button
                        key={filename}
                        onClick={() => downloadFile(filename, content as string)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download {filename}
                      </button>
                    ))}
                  </div>
                )}

                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-x-auto max-h-96 bg-black/30 p-3 rounded">
                  {resultData.implementation}
                </pre>

                {resultData.files_modified && resultData.files_modified.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    <strong>Files created:</strong> {resultData.files_modified.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tester's Results */}
        {resultData.test_results && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('tests')}
              className="w-full px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3"
            >
              <TestTube className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Tester's Results</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {expandedSections.has('tests') ? '▼' : '▶'}
              </span>
            </button>
            {expandedSections.has('tests') && (
              <div className="p-4 bg-secondary/10">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                  {typeof resultData.test_results === 'string'
                    ? resultData.test_results
                    : JSON.stringify(resultData.test_results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Reviewer's Decision */}
        {resultData.review_decision && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('review')}
              className="w-full px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3"
            >
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">Reviewer's Decision</span>
              <span className="ml-auto">
                <span className={clsx(
                  'text-xs font-semibold px-2 py-1 rounded',
                  resultData.review_decision === 'APPROVED'
                    ? 'bg-green-500/20 text-green-400'
                    : resultData.review_decision === 'NEEDS_CHANGES'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                )}>
                  {resultData.review_decision}
                </span>
              </span>
            </button>
            {expandedSections.has('review') && resultData.review_feedback && (
              <div className="p-4 bg-secondary/10">
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
                  {resultData.review_feedback}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Success Status */}
        {resultData.success !== undefined && (
          <div className={clsx(
            'p-3 rounded-lg border flex items-center gap-2',
            resultData.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          )}>
            <CheckCircle className={clsx(
              'w-4 h-4',
              resultData.success ? 'text-green-400' : 'text-yellow-400'
            )} />
            <span className={clsx(
              'text-sm font-medium',
              resultData.success ? 'text-green-400' : 'text-yellow-400'
            )}>
              {resultData.success ? 'Workflow completed successfully' : 'Workflow completed with issues'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Done event
  if (type === 'done') {
    const doneData = data as { message: string };
    return (
      <div className="animate-fade-in">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-semibold text-green-400">
                Task Complete
              </div>
              <div className="text-xs text-muted-foreground">{doneData.message}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
