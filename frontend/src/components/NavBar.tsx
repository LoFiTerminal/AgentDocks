'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Github } from 'lucide-react';

export const NavBar = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Name */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size={36} />
            <span className="font-bold text-lg">AgentDocks.ai</span>
          </button>

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => router.push('/templates')}
              className="text-sm font-medium hover:text-[#F59E0B] transition-colors"
            >
              Templates
            </button>
            <a
              href="#quick-start"
              className="text-sm font-medium hover:text-[#F59E0B] transition-colors"
            >
              Docs
            </a>
            <a
              href="https://github.com/LoFiTerminal/AgentDocks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:text-[#F59E0B] transition-colors flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {/* Right: Badges + CTA */}
          <div className="flex items-center gap-3">
            {/* Badges */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-500">100% Local</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 flex items-center gap-1.5">
                <span className="text-xs">⭐</span>
                <span className="text-xs font-semibold">Open Source</span>
              </div>
            </div>

            {/* Get Started Button */}
            <button
              onClick={() => router.push('/onboarding')}
              className="px-4 py-2 bg-[#F59E0B] text-[#1C1917] rounded-lg text-sm font-semibold hover:bg-[#D97706] transition-colors flex items-center gap-1"
            >
              Get Started
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
