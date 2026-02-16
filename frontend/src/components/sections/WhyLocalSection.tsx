'use client';

import { Check, X } from 'lucide-react';

export const WhyLocalSection = () => {
  const cloudTools = [
    'Your code sent to remote servers',
    'API keys stored in someone else database',
    'Requires internet connection',
    'Monthly subscriptions',
    'Rate limited by the platform',
  ];

  const agentDocks = [
    'Everything executes on your Mac',
    'Keys encrypted in your macOS Keychain',
    'Works offline with Ollama + Docker',
    'Free forever — bring your own API keys',
    'No limits — run as many agents as you want',
  ];

  return (
    <div className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Your Machine. Your Keys. Your Data.
          </h2>
          <p className="text-xl text-muted-foreground">
            Unlike cloud-based AI tools, AgentDocks runs entirely on your computer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl border border-border bg-background/50 opacity-60">
            <h3 className="text-xl font-bold mb-6 text-muted-foreground">Cloud AI Tools</h3>
            <ul className="space-y-4">
              {cloudTools.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-4xl font-bold text-muted-foreground">VS</div>
          </div>

          <div className="p-8 rounded-2xl border-2 border-[#F59E0B] bg-[#F59E0B]/5 shadow-2xl shadow-[#F59E0B]/10">
            <h3 className="text-xl font-bold mb-6 text-[#F59E0B]">AgentDocks</h3>
            <ul className="space-y-4">
              {agentDocks.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
