'use client';

import { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
}

export const ShareModal = ({ shareUrl, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-secondary border-2 border-[#F59E0B]/30 rounded-2xl shadow-2xl scale-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
              <Share2 className="w-8 h-8 text-[#F59E0B]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Run Shared Successfully!
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Anyone with this link can view this agent run
          </p>

          {/* Share URL */}
          <div className="space-y-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-sm font-mono text-foreground"
              onClick={(e) => e.currentTarget.select()}
            />

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={clsx(
                'w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2',
                'transition-all duration-200',
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-[#F59E0B] text-[#1C1917] hover:bg-[#D97706]'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-xs text-center text-muted-foreground">
            Shared runs are stored locally on your machine
          </p>
        </div>
      </div>
    </div>
  );
};
