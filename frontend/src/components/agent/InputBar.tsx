'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Zap, X } from 'lucide-react';
import { clsx } from 'clsx';

interface InputBarProps {
  onSubmit: (query: string, files?: File[]) => void;
  isRunning: boolean;
  onStop: () => void;
  initialQuery?: string;
}

export const InputBar = ({ onSubmit, isRunning, onStop, initialQuery = '' }: InputBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isRunning) return;

    onSubmit(query, files.length > 0 ? files : undefined);
    setQuery('');
    setFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-border bg-secondary/20 backdrop-blur-sm">
      {/* File chips */}
      {files.length > 0 && (
        <div className="px-6 pt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-sm"
            >
              <Paperclip className="w-3 h-3 text-[#F59E0B]" />
              <span className="text-[#F59E0B] font-medium">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="hover:bg-[#F59E0B]/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3 text-[#F59E0B]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-end gap-3">
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isRunning}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isRunning}
            className={clsx(
              'p-3 rounded-lg border-2 border-border hover:border-[#F59E0B] transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border'
            )}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Text input */}
          <div className="flex-1">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe what you want the agent to do..."
              disabled={isRunning}
              rows={1}
              className={clsx(
                'w-full px-4 py-3 rounded-lg resize-none',
                'bg-secondary border-2 border-border',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:border-[#F59E0B]',
                'transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>

          {/* Submit/Stop button */}
          {isRunning ? (
            <button
              type="button"
              onClick={onStop}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              className={clsx(
                'px-6 py-3 bg-[#F59E0B] text-[#1C1917] rounded-lg font-semibold',
                'flex items-center gap-2 transition-colors',
                'hover:bg-[#D97706]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F59E0B]'
              )}
            >
              <Zap className="w-4 h-4" />
              Run
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
