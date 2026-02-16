'use client';

import { Terminal, Key, Rocket } from 'lucide-react';

export const HowItWorksSection = () => {
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Three Steps. That&apos;s It.
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16">
          From zero to running agents in under 2 minutes
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Lines */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-border -z-10" />

          {/* Step 1 */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-6">
              <Terminal className="w-10 h-10 text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Install</h3>
            <p className="text-muted-foreground mb-4">One command. Two minutes.</p>
            <code className="text-xs bg-secondary px-3 py-2 rounded font-mono block">
              curl ... | bash
            </code>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-6">
              <Key className="w-10 h-10 text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Configure</h3>
            <p className="text-muted-foreground mb-4">Paste your API key. Pick a model.</p>
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-1 bg-secondary rounded">Claude</span>
              <span className="px-2 py-1 bg-secondary rounded">GPT</span>
              <span className="px-2 py-1 bg-secondary rounded">DeepSeek</span>
              <span className="px-2 py-1 bg-secondary rounded">Llama</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">+ 300 more via OpenRouter</p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-[#F59E0B]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Launch</h3>
            <p className="text-muted-foreground mb-4">Describe a task in plain English.</p>
            <p className="text-sm">Watch it happen.</p>
            <p className="text-sm text-muted-foreground mt-4">
              Your agent writes code, runs it, and delivers results.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
