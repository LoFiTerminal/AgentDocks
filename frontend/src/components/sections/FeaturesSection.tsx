'use client';

import { Brain, Shield, Activity, Grid3x3, Share2, Plug } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'Any AI Model',
      description: 'Claude, GPT-4, DeepSeek, Llama, Qwen — or any of 300+ models via OpenRouter. Run locally with Ollama for zero cloud dependency.',
    },
    {
      icon: Shield,
      title: 'Safe Sandboxes',
      description: 'Every task runs in a disposable container. When done, it self-destructs. Your system stays untouched.',
    },
    {
      icon: Activity,
      title: 'Real-Time Streaming',
      description: 'Watch every step as it happens. Tool calls, code execution, file creation — streamed live to your screen.',
    },
    {
      icon: Grid3x3,
      title: '18+ Templates',
      description: 'Pre-built tasks for data analysis, code review, web scraping, DevOps, and more. One click to launch.',
    },
    {
      icon: Share2,
      title: 'Shareable Runs',
      description: 'Generate a link to any agent run. Share with your team or the world. Your own AI portfolio.',
    },
    {
      icon: Plug,
      title: 'Extensible (MCP)',
      description: 'Connect external tools via MCP — Google Drive, GitHub, Slack, databases. Coming soon.',
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Everything You Need. Nothing You Don&apos;t.
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16">
          Powerful features that respect your privacy
        </p>

        {/* 2x3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl border border-border bg-secondary/20 hover:border-[#F59E0B]/50 transition-colors"
              >
                <Icon className="w-12 h-12 text-[#F59E0B] mb-4" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
