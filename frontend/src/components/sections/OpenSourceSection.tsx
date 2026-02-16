'use client';

import { Github } from 'lucide-react';

export const OpenSourceSection = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-24 h-24 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-8">
          <Github className="w-12 h-12 text-[#F59E0B]" />
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built in the Open</h2>
        <p className="text-xl text-muted-foreground mb-12">
          AgentDocks is MIT licensed. Read every line. Fork it. Improve it. Make it yours.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div>
            <div className="text-5xl font-bold text-[#F59E0B] mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Open Source</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#F59E0B] mb-2">MIT</div>
            <div className="text-sm text-muted-foreground">Licensed</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#F59E0B] mb-2">0</div>
            <div className="text-sm text-muted-foreground">Telemetry</div>
          </div>
        </div>

        {/* CTA */}
        <a
          href="https://github.com/LoFiTerminal/AgentDocks"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#F59E0B] text-[#1C1917] rounded-lg font-semibold text-lg hover:bg-[#D97706] transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#F59E0B]/20"
        >
          <Github className="w-5 h-5" />
          Star on GitHub ⭐
        </a>

        <p className="mt-6">
          <a
            href="https://github.com/LoFiTerminal/AgentDocks/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F59E0B] hover:underline"
          >
            Join the community →
          </a>
        </p>
      </div>
    </section>
  );
};
