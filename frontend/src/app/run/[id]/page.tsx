'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageItem } from '@/components/agent/MessageItem';
import { AgentMessage } from '@/hooks/useAgent';
import { Logo } from '@/components/Logo';
import { Clock, Zap, ChevronRight, ExternalLink } from 'lucide-react';

interface SharedRun {
  id: string;
  messages: AgentMessage[];
  query: string;
  model: string;
  duration_seconds: number;
  tool_count: number;
  created_at: string;
}

export default function SharedRunPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;

  const [run, setRun] = useState<SharedRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);

  useEffect(() => {
    const fetchRun = async () => {
      try {
        const response = await fetch(`/api/runs/shared/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Run not found');
          } else {
            setError('Failed to load run');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setRun(data);
        setLoading(false);

        // Update meta tags for social sharing
        document.title = `${data.query.slice(0, 50)}... - AgentDocks Run`;

        // Remove existing og tags
        const existingOgTags = document.querySelectorAll('meta[property^="og:"], meta[name="twitter:"]');
        existingOgTags.forEach(tag => tag.remove());

        // Add Open Graph tags
        const metaTags = [
          { property: 'og:title', content: `Agent Run: ${data.query.slice(0, 60)}...` },
          { property: 'og:description', content: `See this AI agent run on AgentDocks. Model: ${data.model}, Tools: ${data.tool_count}, Duration: ${data.duration_seconds.toFixed(0)}s` },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: window.location.href },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: `Agent Run: ${data.query.slice(0, 60)}...` },
          { name: 'twitter:description', content: `See this AI agent run on AgentDocks. Model: ${data.model}` },
        ];

        metaTags.forEach(({ property, name, content }) => {
          const meta = document.createElement('meta');
          if (property) meta.setAttribute('property', property);
          if (name) meta.setAttribute('name', name);
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        });

        // Start staggered reveal animation
        let index = 0;
        const interval = setInterval(() => {
          if (index < data.messages.length) {
            setVisibleMessages(index + 1);
            index++;
          } else {
            clearInterval(interval);
          }
        }, 50);

        return () => clearInterval(interval);
      } catch (err) {
        setError('Failed to load run');
        setLoading(false);
      }
    };

    fetchRun();
  }, [shareId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#171412] text-foreground flex items-center justify-center">
        <div className="max-w-4xl w-full p-8 space-y-6 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-8 bg-secondary rounded w-2/3" />
              <div className="h-4 bg-secondary rounded w-1/3" />
            </div>
          </div>

          {/* Query skeleton */}
          <div className="h-24 bg-secondary rounded-xl" />

          {/* Messages skeleton */}
          <div className="space-y-4">
            <div className="h-32 bg-secondary rounded-xl" />
            <div className="h-32 bg-secondary rounded-xl" />
            <div className="h-32 bg-secondary rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !run) {
    return (
      <div className="min-h-screen bg-[#171412] text-foreground flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Run Not Found</h1>
            <p className="text-muted-foreground">
              This shared run doesn&apos;t exist or has been removed.
            </p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-lg bg-[#F59E0B] text-[#1C1917] font-semibold hover:bg-[#D97706] transition-colors inline-flex items-center gap-2"
          >
            Go to Homepage
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Format timestamp
  const timestamp = new Date(run.created_at).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#171412] text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size={40} />
            <div>
              <h1 className="text-xl font-bold">Shared Agent Run</h1>
              <p className="text-sm text-muted-foreground">{timestamp}</p>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-sm font-semibold">
              {run.model}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {formatDuration(run.duration_seconds)}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm font-medium flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-muted-foreground" />
              {run.tool_count} tools
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Query section */}
        <div className="border-2 border-[#F59E0B]/30 rounded-xl bg-[#F59E0B]/5 p-6">
          <div className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider mb-3">
            Original Query
          </div>
          <p className="text-lg leading-relaxed">{run.query}</p>
        </div>

        {/* Run replay section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xl font-bold">Agent Run Replay</h2>
          </div>

          <div className="space-y-6">
            {run.messages.slice(0, visibleMessages).map((message, index) => (
              <div
                key={message.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MessageItem message={message} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        {visibleMessages >= run.messages.length && (
          <div className="border-t border-border pt-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Want to run agents like this?</h3>
              <p className="text-muted-foreground">
                AgentDocks lets you execute AI agents in disposable sandboxes with full privacy.
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 rounded-lg bg-[#F59E0B] text-[#1C1917] font-semibold hover:bg-[#D97706] transition-colors inline-flex items-center gap-2"
                >
                  Try AgentDocks Free
                  <ChevronRight className="w-5 h-5" />
                </button>

                <a
                  href="https://github.com/LoFiTerminal/AgentDocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg border-2 border-border bg-secondary hover:border-[#F59E0B] transition-colors inline-flex items-center gap-2 font-semibold"
                >
                  View on GitHub
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
