'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  code: string;
}

const INSTALL_TABS: Tab[] = [
  {
    id: 'oneliner',
    label: 'One-Liner',
    code: 'curl -fsSL https://raw.githubusercontent.com/LoFiTerminal/AgentDocks/main/scripts/install.sh | bash',
  },
  {
    id: 'docker',
    label: 'Docker',
    code: 'docker-compose up -d',
  },
  {
    id: 'manual',
    label: 'Manual',
    code: `git clone https://github.com/LoFiTerminal/AgentDocks.git
cd AgentDocks && make install && make dev`,
  },
];

export const CodeTabs = () => {
  const [activeTab, setActiveTab] = useState('oneliner');
  const [copied, setCopied] = useState(false);

  const currentTab = INSTALL_TABS.find((tab) => tab.id === activeTab) || INSTALL_TABS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-3">
        {INSTALL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0D0C0A] text-[#F59E0B] border-b-2 border-[#F59E0B]'
                : 'bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="relative bg-[#0D0C0A] rounded-lg border border-[#292524] p-6">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Code */}
        <pre className="font-mono text-sm text-foreground overflow-x-auto pr-12">
          <code>{currentTab.code}</code>
        </pre>
      </div>

      {/* Below Terminal Text */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Then just type:{' '}
          <code className="px-3 py-1 bg-secondary rounded text-[#F59E0B] font-mono text-sm">
            agentdocks
          </code>{' '}
          <span className="inline-block mx-2">→</span>{' '}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F59E0B] hover:underline font-mono"
          >
            http://localhost:3000
          </a>
        </p>
      </div>
    </div>
  );
};
