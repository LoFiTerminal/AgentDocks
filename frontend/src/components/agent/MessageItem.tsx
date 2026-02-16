'use client';

import { AgentMessage } from '@/hooks/useAgent';
import { CheckCircle, AlertCircle, Terminal, FileText, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface MessageItemProps {
  message: AgentMessage;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const { type, data } = message;

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
