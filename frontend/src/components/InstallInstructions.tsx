'use client';

import { Logo } from '@/components/Logo';
import { Terminal, Copy, Check, ChevronRight, Rocket } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const InstallInstructions = () => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const installCommand = 'curl -fsSL https://raw.githubusercontent.com/LoFiTerminal/AgentDocks/main/scripts/install.sh | bash';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size={60} />
        </div>

        {/* Headline */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Ready to Launch Your First Agent?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AgentDocks runs <span className="text-[#F59E0B] font-semibold">100% on your machine</span> for maximum privacy and security.
          </p>
        </div>

        {/* Three-step guide */}
        <div className="grid gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                <Terminal className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#F59E0B]">STEP 1</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm font-semibold">Open Your Terminal</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  On macOS, press <kbd className="px-2 py-1 bg-secondary rounded text-xs">Cmd+Space</kbd> and type &ldquo;Terminal&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                <Copy className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#F59E0B]">STEP 2</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm font-semibold">Run the Install Command</span>
                </div>
                
                {/* Command box */}
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-[#0D0C0A] border border-[#292524] font-mono text-xs sm:text-sm text-foreground overflow-x-auto">
                    {installCommand}
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Paste this into your terminal and press Enter. Installation takes ~2 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#F59E0B]">STEP 3</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm font-semibold">Launch AgentDocks</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  After installation completes, just type:
                </p>
                <code className="block p-3 rounded-lg bg-[#0D0C0A] border border-[#292524] font-mono text-sm text-[#F59E0B]">
                  agentdocks
                </code>
                <p className="text-sm text-muted-foreground mt-3">
                  It will automatically open in your browser at <span className="text-foreground font-mono">localhost:3000</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Already installed link */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground mb-3">Already installed AgentDocks?</p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F59E0B] text-[#1C1917] font-semibold hover:bg-[#D97706] transition-colors"
          >
            Open AgentDocks
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>

        {/* Back to homepage */}
        <div className="text-center pt-4">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
