import { useState } from 'react';
import { SandboxProvider } from '@/types';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import { clsx } from 'clsx';
import { Cloud, HardDrive, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface SandboxStepProps {
  selected: SandboxProvider | null;
  e2bApiKey: string;
  onSelect: (sandbox: SandboxProvider) => void;
  onE2bKeyChange: (key: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const sandboxOptions = [
  {
    id: 'e2b' as SandboxProvider,
    name: 'E2B',
    subtitle: 'Cloud Sandboxes',
    description: 'Fast, secure cloud-based code execution environments',
    icon: Cloud,
    badge: 'Recommended',
    requiresKey: true,
  },
  {
    id: 'docker' as SandboxProvider,
    name: 'Docker',
    subtitle: 'Local Containers',
    description: 'Run sandboxes locally using Docker on your machine',
    icon: HardDrive,
    badge: 'Local',
    requiresKey: false,
  },
];

export const SandboxStep = ({
  selected,
  e2bApiKey,
  onSelect,
  onE2bKeyChange,
  onNext,
  onBack,
}: SandboxStepProps) => {
  const [showKey, setShowKey] = useState(false);
  const needsE2bKey = selected === 'e2b';
  const canProceed = selected !== null && (selected === 'docker' || e2bApiKey !== '');

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Sandbox Environment</h2>
        <p className="text-muted-foreground">
          Where should AI agents execute code?
        </p>
      </div>

      <div className="grid gap-4">
        {sandboxOptions.map((sandbox) => {
          const Icon = sandbox.icon;
          const isSelected = selected === sandbox.id;

          return (
            <button
              key={sandbox.id}
              onClick={() => onSelect(sandbox.id)}
              className={clsx(
                'relative p-6 rounded-xl border-2 transition-all duration-200',
                'text-left hover:border-[#F59E0B] hover:bg-secondary/50',
                'focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-background',
                isSelected
                  ? 'border-[#F59E0B] bg-secondary/50'
                  : 'border-border bg-secondary/20'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={clsx(
                    'p-3 rounded-lg transition-colors',
                    isSelected ? 'bg-[#F59E0B]' : 'bg-secondary'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-6 h-6',
                      isSelected ? 'text-[#1C1917]' : 'text-muted-foreground'
                    )}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{sandbox.name}</h3>
                    <span className="text-sm text-[#F59E0B]">
                      {sandbox.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sandbox.description}
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
                  {sandbox.badge}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#1C1917]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {needsE2bKey && (
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-foreground">
                E2B API Key
              </label>
              <Tooltip content="E2B provides disposable cloud sandboxes where your agent runs code safely. Free tier includes 100 hours/month. Get one at e2b.dev/dashboard" />
            </div>
            <a
              href="https://e2b.dev/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#F59E0B] hover:text-[#D97706] flex items-center gap-1"
            >
              Get API key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={e2bApiKey}
              onChange={(e) => onE2bKeyChange(e.target.value)}
              placeholder="e2b_..."
              className={clsx(
                'w-full px-4 py-3 pr-12 rounded-lg',
                'bg-secondary border border-border',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent',
                'transition-all duration-200'
              )}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {selected === 'docker' && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Make sure Docker is
            installed and running on your machine before proceeding.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue
        </Button>
      </div>
    </div>
  );
};
