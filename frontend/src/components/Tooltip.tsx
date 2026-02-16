'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  className?: string;
}

export const Tooltip = ({ content, className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-muted-foreground hover:text-[#F59E0B] transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>

      {isVisible && (
        <div
          className={clsx(
            'absolute z-50 w-80 p-3 rounded-lg',
            'bg-[#1C1917] border border-border shadow-2xl',
            'text-sm text-foreground leading-relaxed',
            'animate-scale-fade-in',
            'bottom-full left-1/2 -translate-x-1/2 mb-2',
            className
          )}
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-[#1C1917]" />
          </div>

          {content}
        </div>
      )}
    </div>
  );
};
