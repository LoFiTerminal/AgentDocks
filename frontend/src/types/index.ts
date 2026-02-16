export type AIProvider = 'anthropic' | 'openrouter' | 'ollama';
export type SandboxProvider = 'e2b' | 'docker';

export interface OnboardingConfig {
  provider: AIProvider | null;
  apiKey: string;
  model: string;
  sandbox: SandboxProvider | null;
  e2bApiKey: string;
}

export interface ProviderOption {
  id: AIProvider;
  name: string;
  description: string;
  icon: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}
