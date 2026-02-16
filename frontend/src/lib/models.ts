import { ModelOption, AIProvider } from '@/types';

export const modelsByProvider: Record<AIProvider, ModelOption[]> = {
  anthropic: [
    {
      id: 'claude-opus-4-6',
      name: 'Claude 4.6 Opus',
      description: 'Most capable model, best for complex tasks',
    },
    {
      id: 'claude-sonnet-4-5-20250929',
      name: 'Claude 4.5 Sonnet',
      description: 'Balanced performance and speed',
    },
    {
      id: 'claude-haiku-4-5-20251001',
      name: 'Claude 4.5 Haiku',
      description: 'Fast and efficient',
    },
  ],
  openrouter: [
    {
      id: 'anthropic/claude-opus-4-6',
      name: 'Claude 4.6 Opus',
      description: 'Most capable Claude model',
    },
    {
      id: 'anthropic/claude-sonnet-4-5',
      name: 'Claude 4.5 Sonnet',
      description: 'Balanced Claude model',
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'OpenAI\'s latest GPT-4',
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      description: 'Multimodal GPT-4',
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      description: 'Google\'s advanced model',
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B',
      description: 'Meta\'s open-source model',
    },
  ],
  ollama: [
    {
      id: 'llama3.3',
      name: 'Llama 3.3',
      description: 'Meta\'s latest open model',
    },
    {
      id: 'qwen2.5-coder',
      name: 'Qwen 2.5 Coder',
      description: 'Specialized for coding',
    },
    {
      id: 'mistral',
      name: 'Mistral',
      description: 'Fast and capable',
    },
    {
      id: 'codellama',
      name: 'Code Llama',
      description: 'Code generation specialist',
    },
  ],
};
