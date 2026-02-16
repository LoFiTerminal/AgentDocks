import { OnboardingConfig } from '@/types';
import { Button } from '@/components/Button';
import { Check, Loader2 } from 'lucide-react';

interface ReadyStepProps {
  config: OnboardingConfig;
  onLaunch: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const providerNames = {
  anthropic: 'Anthropic (Claude)',
  openrouter: 'OpenRouter',
  ollama: 'Ollama',
};

const sandboxNames = {
  e2b: 'E2B (Cloud)',
  docker: 'Docker (Local)',
};

export const ReadyStep = ({ config, onLaunch, onBack, isLoading }: ReadyStepProps) => {
  const configItems = [
    {
      label: 'AI Provider',
      value: config.provider ? providerNames[config.provider] : '',
    },
    {
      label: 'Model',
      value: config.model,
    },
    {
      label: 'Sandbox',
      value: config.sandbox ? sandboxNames[config.sandbox] : '',
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </div>
        <h2 className="text-3xl font-bold">You&apos;re All Set!</h2>
        <p className="text-muted-foreground">
          Review your configuration and launch AgentDocks
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configuration Summary</h3>
        <div className="space-y-3">
          {configItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {item.label}
              </span>
              <span className="text-sm font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 border border-[#F59E0B]/20">
        <h4 className="font-semibold mb-2 text-[#F59E0B]">Privacy First</h4>
        <p className="text-sm text-muted-foreground">
          Your configuration is stored locally on your machine. API keys are never
          sent to our servers - they&apos;re used only to connect directly to your chosen
          AI provider and sandbox environment.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={onLaunch} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Launching...
            </>
          ) : (
            'Launch AgentDocks'
          )}
        </Button>
      </div>
    </div>
  );
};
