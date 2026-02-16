'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { ProviderStep } from '@/components/onboarding/ProviderStep';
import { ApiKeyStep } from '@/components/onboarding/ApiKeyStep';
import { SandboxStep } from '@/components/onboarding/SandboxStep';
import { ReadyStep } from '@/components/onboarding/ReadyStep';
import { saveConfig } from '@/lib/api';
import { InstallInstructions } from '@/components/InstallInstructions';

export default function OnboardingPage() {
  const router = useRouter();
  const { step, config, updateConfig, nextStep, prevStep, canProceed } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    setIsLocalhost(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }, []);

  const handleNext = () => {
    if (canProceed()) {
      setDirection('forward');
      nextStep();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      // First step - go back to home page
      router.push('/');
    } else {
      setDirection('back');
      prevStep();
    }
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await saveConfig(config);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save config:', err);
      setError('Failed to save configuration. Please try again.');
      setIsLoading(false);
    }
  };

  // If not localhost, show install instructions
  if (!isLocalhost) {
    return <InstallInstructions />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <StepIndicator currentStep={step - 1} totalSteps={4} />

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-center">
            {error}
          </div>
        )}

        <div
          key={step}
          className={direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
        >
          {step === 2 && (
            <ProviderStep
              selected={config.provider}
              onSelect={(provider) => updateConfig({ provider })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 3 && config.provider && (
            <ApiKeyStep
              provider={config.provider}
              apiKey={config.apiKey}
              model={config.model}
              onApiKeyChange={(apiKey) => updateConfig({ apiKey })}
              onModelSelect={(model) => updateConfig({ model })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 4 && (
            <SandboxStep
              selected={config.sandbox}
              e2bApiKey={config.e2bApiKey}
              onSelect={(sandbox) => updateConfig({ sandbox })}
              onE2bKeyChange={(e2bApiKey) => updateConfig({ e2bApiKey })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {step === 5 && (
            <ReadyStep
              config={config}
              onLaunch={handleLaunch}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
