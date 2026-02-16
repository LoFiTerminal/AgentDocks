import { useState, useEffect } from 'react';
import { AIProvider } from '@/types';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import { modelsByProvider } from '@/lib/models';
import { clsx } from 'clsx';
import { Eye, EyeOff, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiKeyStepProps {
  provider: AIProvider;
  apiKey: string;
  model: string;
  onApiKeyChange: (key: string) => void;
  onModelSelect: (model: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const providerInfo = {
  anthropic: {
    name: 'Anthropic',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    keyPrefix: 'sk-ant-',
    tooltip: 'Your API key from Anthropic. This lets AgentDocks use Claude to power the AI agent. You\'re billed by Anthropic based on usage. Get one at console.anthropic.com/settings/keys',
  },
  openrouter: {
    name: 'OpenRouter',
    keyLabel: 'OpenRouter API Key',
    keyPlaceholder: 'sk-or-...',
    helpUrl: 'https://openrouter.ai/keys',
    keyPrefix: 'sk-or-',
    tooltip: 'OpenRouter gives you access to 300+ AI models through a single key. Pay per token used. Get one at openrouter.ai/keys',
  },
  ollama: {
    name: 'Ollama',
    keyLabel: 'Ollama URL (optional)',
    keyPlaceholder: 'http://localhost:11434',
    helpUrl: 'https://ollama.ai/download',
    keyPrefix: null,
    tooltip: 'Ollama runs AI models locally on your Mac. No API key needed - just make sure Ollama is installed and running.',
  },
};

export const ApiKeyStep = ({
  provider,
  apiKey,
  model,
  onApiKeyChange,
  onModelSelect,
  onNext,
  onBack,
}: ApiKeyStepProps) => {
  const [showKey, setShowKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const info = providerInfo[provider];
  const models = modelsByProvider[provider];
  const isOllama = provider === 'ollama';

  // Validate API key format in real-time (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!apiKey) {
        setValidationError(null);
        setVerificationResult(null);
        return;
      }

      if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
        setValidationError('Anthropic keys start with sk-ant-. Get yours at console.anthropic.com');
        setVerificationResult(null);
      } else if (provider === 'openrouter' && !apiKey.startsWith('sk-or-')) {
        setValidationError('OpenRouter keys start with sk-or-. Get yours at openrouter.ai/keys');
        setVerificationResult(null);
      } else {
        setValidationError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [apiKey, provider]);

  // Check if Ollama is running
  useEffect(() => {
    if (provider === 'ollama') {
      const checkOllama = async () => {
        try {
          const url = apiKey || 'http://localhost:11434';
          const response = await fetch(`${url}/api/tags`, { method: 'GET' });
          if (response.ok) {
            setVerificationResult({ success: true, message: 'Ollama detected!' });
            setValidationError(null);
          } else {
            setValidationError('Ollama not detected — is it running?');
            setVerificationResult(null);
          }
        } catch (err) {
          setValidationError('Ollama not detected — is it running?');
          setVerificationResult(null);
        }
      };

      const timer = setTimeout(checkOllama, 500);
      return () => clearTimeout(timer);
    }
  }, [provider, apiKey]);

  const handleVerifyKey = async () => {
    if (!apiKey || isOllama) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/config/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: apiKey }),
      });

      const result = await response.json();

      if (result.valid) {
        setVerificationResult({ success: true, message: 'Key verified!' });
        setValidationError(null);
      } else {
        setVerificationResult({ success: false, message: result.message || 'Invalid key' });
      }
    } catch (err) {
      setVerificationResult({ success: false, message: 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2 page-enter">
        <h2 className="text-3xl font-bold">Configure {info.name}</h2>
        <p className="text-muted-foreground">
          {isOllama
            ? 'Make sure Ollama is running locally'
            : 'Enter your API key to get started'}
        </p>
      </div>

      <div className="space-y-6 page-enter stagger-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-foreground">
                {info.keyLabel}
              </label>
              <Tooltip content={info.tooltip} />
            </div>
            <a
              href={info.helpUrl}
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
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={info.keyPlaceholder}
              className={clsx(
                'w-full px-4 py-3 pr-24 rounded-lg',
                'bg-secondary border-2',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent',
                'transition-all duration-200',
                validationError
                  ? 'border-red-500'
                  : verificationResult?.success
                  ? 'border-green-500'
                  : 'border-border'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {verificationResult && (
                <div className="flex items-center gap-1">
                  {verificationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
              {!isOllama && (
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {validationError && (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {validationError}
            </p>
          )}

          {verificationResult && (
            <p
              className={clsx(
                'text-sm flex items-center gap-2',
                verificationResult.success ? 'text-green-500' : 'text-red-500'
              )}
            >
              {verificationResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {verificationResult.message}
            </p>
          )}

          {!isOllama && (
            <button
              onClick={handleVerifyKey}
              disabled={!apiKey || !!validationError || isVerifying}
              className={clsx(
                'text-sm px-4 py-2 rounded-lg border-2 border-[#F59E0B] text-[#F59E0B]',
                'hover:bg-[#F59E0B]/10 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Key'
              )}
            </button>
          )}

          {isOllama && (
            <p className="text-xs text-muted-foreground">
              Leave empty to use default (http://localhost:11434)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-foreground">
              Select Model
            </label>
            <Tooltip content="Choose which AI model powers your agent. Larger models are smarter but cost more per use." />
          </div>
          <div className="grid gap-3">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => onModelSelect(m.id)}
                className={clsx(
                  'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                  'hover:border-[#F59E0B] hover:bg-secondary/50',
                  'focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-background',
                  model === m.id
                    ? 'border-[#F59E0B] bg-secondary/50'
                    : 'border-border bg-secondary/20'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">{m.name}</h4>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                  {model === m.id && (
                    <div className="w-5 h-5 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-[#1C1917]"
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
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between page-enter stagger-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!apiKey || !model || !!validationError}>
          Continue
        </Button>
      </div>
    </div>
  );
};
