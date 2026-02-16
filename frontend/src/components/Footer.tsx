'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Github } from 'lucide-react';

export const Footer = () => {
  const router = useRouter();

  return (
    <footer className="border-t border-border bg-secondary/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Three Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo size={40} />
              <span className="font-bold text-lg">AgentDocks.ai</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI agents that run on your machine.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Privacy First</span>
              <span>·</span>
              <span>Open Source</span>
              <span>·</span>
              <span>MIT Licensed</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  Get Started
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/templates')}
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  Templates
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/LoFiTerminal/AgentDocks#documentation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LoFiTerminal/AgentDocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/LoFiTerminal/AgentDocks/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  GitHub Discussions
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LoFiTerminal/AgentDocks/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  Report a Bug
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LoFiTerminal/AgentDocks/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  Feature Requests
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LoFiTerminal/AgentDocks#contributing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-[#F59E0B] transition-colors"
                >
                  Contributing Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 AgentDocks Contributors · MIT License ·{' '}
            <a
              href="https://github.com/LoFiTerminal/AgentDocks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F59E0B] transition-colors"
            >
              github.com/LoFiTerminal/AgentDocks
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
