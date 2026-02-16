'use client';

import { useRouter } from 'next/navigation';
import { AnimatedTerminal } from '@/components/AnimatedTerminal';
import { AnimatedTagline } from '@/components/AnimatedTagline';
import { Check, ChevronDown, Github } from 'lucide-react';
import { useState, useEffect } from 'react';

export const HeroSection = () => {
  const router = useRouter();
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }, []);

  const handleGetStarted = () => {
    if (isLocalhost) {
      router.push('/onboarding');
    } else {
      // Scroll to installation instructions
      document.getElementById('quick-start')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Left Side - 60% width */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <span className="text-sm font-semibold text-[#F59E0B]">
                Open Source · Privacy First · Local
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="gradient-text">AI Agents That Run</span>
              <br />
              <AnimatedTagline />
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
              Give an AI agent a task. It writes code, executes it, creates files, and delivers
              results — all inside a safe sandbox on your Mac.{' '}
              <span className="text-foreground font-semibold">No cloud required.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#F59E0B] text-[#1C1917] rounded-lg font-semibold text-lg hover:bg-[#D97706] transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#F59E0B]/20 flex items-center justify-center gap-2"
              >
                {isLocalhost ? 'Get Started Free' : 'Install Locally'}
                <span>→</span>
              </button>
              <a
                href="https://github.com/LoFiTerminal/AgentDocks"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-border hover:border-[#F59E0B] rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 hover:bg-secondary"
              >
                <Github className="w-5 h-5" />
                View on GitHub ↗
              </a>
            </div>

            {/* Already installed link (only show on public site) */}
            {!isLocalhost && (
              <div className="text-center">
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors inline-flex items-center gap-1"
                >
                  Already installed? Open AgentDocks →
                </a>
              </div>
            )}

            {/* Trust Line */}
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              MIT Licensed
              <span>·</span>
              <Check className="w-4 h-4 text-green-500" />
              No account needed
              <span>·</span>
              <Check className="w-4 h-4 text-green-500" />
              Your keys stay local
            </p>
          </div>

          {/* Right Side - 40% width */}
          <div className="lg:col-span-2">
            <AnimatedTerminal />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-muted-foreground" />
      </div>
    </section>
  );
};
