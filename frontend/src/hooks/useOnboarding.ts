'use client';

import { useState } from 'react';
import { OnboardingConfig, AIProvider, SandboxProvider } from '@/types';

export const useOnboarding = () => {
  const [step, setStep] = useState(2); // Start at step 2 (Provider selection)
  const [config, setConfig] = useState<OnboardingConfig>({
    provider: null,
    apiKey: '',
    model: '',
    sandbox: null,
    e2bApiKey: '',
  });

  const updateConfig = (updates: Partial<OnboardingConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 2)); // Don't go below step 2

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return config.provider !== null;
      case 3:
        return config.apiKey !== '' && config.model !== '';
      case 4:
        return config.sandbox !== null && (config.sandbox === 'docker' || config.e2bApiKey !== '');
      case 5:
        return true;
      default:
        return false;
    }
  };

  return {
    step,
    config,
    updateConfig,
    nextStep,
    prevStep,
    canProceed,
  };
};
