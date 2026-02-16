'use client';

import { Shield, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface PrivacyIndicatorProps {
  isFullyLocal: boolean;
  className?: string;
}

export const PrivacyIndicator = ({ isFullyLocal, className }: PrivacyIndicatorProps) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
        isFullyLocal
          ? 'bg-green-500/10 border-green-500/30 text-green-500'
          : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]',
        className
      )}
    >
      <div
        className={clsx(
          'w-2 h-2 rounded-full animate-pulse',
          isFullyLocal ? 'bg-green-500' : 'bg-[#F59E0B]'
        )}
      />
      <Lock className="w-3 h-3" />
      <span>{isFullyLocal ? '100% Local' : 'Cloud Mode'}</span>
    </div>
  );
};
