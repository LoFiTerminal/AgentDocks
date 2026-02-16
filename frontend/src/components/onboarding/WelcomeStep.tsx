import { Button } from '@/components/Button';
import { Rocket } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-[#F59E0B] blur-3xl opacity-20 rounded-full" />
        <div className="relative bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-6 rounded-3xl">
          <Rocket className="w-16 h-16 text-[#1C1917]" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#F59E0B] to-[#FCD34D] bg-clip-text text-transparent">
          AgentDocks
        </h1>
        <p className="text-2xl text-muted-foreground">
          Launch AI agents in seconds
        </p>
      </div>

      <div className="max-w-md space-y-4 text-muted-foreground">
        <p>
          Connect your AI provider, choose a sandbox environment, and start running
          powerful AI agents that can execute code in isolated, disposable containers.
        </p>
        <p className="text-sm">
          Your configuration stays local. No data leaves your machine.
        </p>
      </div>

      <Button onClick={onNext} size="lg" className="mt-8">
        Get Started
      </Button>
    </div>
  );
};
