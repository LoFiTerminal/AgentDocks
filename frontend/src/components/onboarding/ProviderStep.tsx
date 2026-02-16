import { AIProvider } from '@/types';
import { Button } from '@/components/Button';
import { clsx } from 'clsx';
import { Brain, Globe, Laptop } from 'lucide-react';

interface ProviderStepProps {
  selected: AIProvider | null;
  onSelect: (provider: AIProvider) => void;
  onNext: () => void;
  onBack: () => void;
}

const providers = [
  {
    id: 'anthropic' as AIProvider,
    name: 'Anthropic',
    subtitle: 'Claude',
    description: 'Industry-leading AI models from Anthropic',
    icon: Brain,
    badge: 'Recommended',
  },
  {
    id: 'openrouter' as AIProvider,
    name: 'OpenRouter',
    subtitle: '300+ models',
    description: 'Access to hundreds of models through one API',
    icon: Globe,
    badge: 'Most Options',
  },
  {
    id: 'ollama' as AIProvider,
    name: 'Ollama',
    subtitle: 'Local & Offline',
    description: 'Run open-source models locally on your machine',
    icon: Laptop,
    badge: 'Privacy',
  },
];

export const ProviderStep = ({ selected, onSelect, onNext, onBack }: ProviderStepProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your AI Provider</h2>
        <p className="text-muted-foreground">
          Select how you want to access AI models
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {providers.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selected === provider.id;

          return (
            <button
              key={provider.id}
              onClick={() => onSelect(provider.id)}
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
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    <span className="text-sm text-[#F59E0B]">
                      {provider.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {provider.description}
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium">
                  {provider.badge}
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

      <div className="flex justify-between max-w-2xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!selected}>
          Continue
        </Button>
      </div>
    </div>
  );
};
