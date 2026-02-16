'use client';

import { useEffect, useRef } from 'react';
import { AgentMessage } from '@/hooks/useAgent';
import { MessageItem } from './MessageItem';
import { Sparkles, Share2 } from 'lucide-react';

interface AgentConsoleProps {
  messages: AgentMessage[];
  onExampleClick: (prompt: string) => void;
  onShare?: () => void;
  canShare?: boolean;
}

const EXAMPLE_PROMPTS = [
  'Analyze this CSV and make a chart',
  'Build a Python web scraper',
  'Create a React landing page',
];

export const AgentConsole = ({ messages, onExampleClick, onShare, canShare }: AgentConsoleProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[#F59E0B]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Tell the agent what to do</h2>
            <p className="text-lg text-muted-foreground">
              Describe your task in plain English. The agent will execute it in a safe sandbox.
            </p>
          </div>

          {/* Example prompts */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Try an example:
            </div>
            <div className="grid gap-3">
              {EXAMPLE_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onExampleClick(prompt)}
                  className="p-4 rounded-lg border-2 border-border bg-secondary/20 hover:border-[#F59E0B] hover:bg-secondary/50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F59E0B]/20 transition-colors">
                      <span className="text-lg">💡</span>
                    </div>
                    <span className="text-sm font-medium group-hover:text-[#F59E0B] transition-colors">
                      {prompt}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Messages view
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))}

        {/* Share button after done event */}
        {canShare && onShare && (
          <div className="flex justify-center pt-4 animate-fade-in">
            <button
              onClick={onShare}
              className="px-6 py-3 rounded-lg border-2 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <Share2 className="w-5 h-5" />
              Share this run
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
