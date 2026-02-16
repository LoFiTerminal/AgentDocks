'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  from_agent: string;
  to_agent: string;
  message_type: string;
  content: any;
  timestamp: string;
}

interface MessageTimelineProps {
  messages: Message[];
}

const messageTypeLabels: Record<string, string> = {
  plan_complete: 'Plan Complete',
  implementation_complete: 'Implementation Done',
  test_results: 'Test Results',
  review_complete: 'Review Complete',
  request_info: 'Info Request',
  error: 'Error',
};

const messageTypeColors: Record<string, string> = {
  plan_complete: 'text-blue-400',
  implementation_complete: 'text-green-400',
  test_results: 'text-yellow-400',
  review_complete: 'text-pink-400',
  request_info: 'text-amber-400',
  error: 'text-red-400',
};

export function MessageTimeline({ messages }: MessageTimelineProps) {
  if (!messages.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No inter-agent messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => {
        const typeColor = messageTypeColors[message.message_type] || 'text-foreground';
        const typeLabel = messageTypeLabels[message.message_type] || message.message_type;

        return (
          <motion.div
            key={`${message.timestamp}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border rounded-lg p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            {/* Header: From -> To */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium capitalize">
                {message.from_agent.split('_')[0]}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium capitalize">
                {message.to_agent.split('_')[0]}
              </span>

              <div className="flex-1" />

              {/* Timestamp */}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </span>
            </div>

            {/* Message Type */}
            <div className={`text-xs font-medium ${typeColor} mb-1`}>
              {typeLabel}
            </div>

            {/* Content Preview */}
            {typeof message.content === 'string' ? (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {message.content}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {JSON.stringify(message.content).slice(0, 100)}...
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
