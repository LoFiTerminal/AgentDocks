'use client';

import { useState, useCallback, useRef } from 'react';

export interface AgentMessage {
  id: string;
  type: 'status' | 'tool_use' | 'tool_result' | 'text' | 'file' | 'error' | 'done' | 'result' | 'browser_action' | 'screenshot';
  data: Record<string, unknown>;
  timestamp: number;
}

export const useAgent = () => {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const runAgent = useCallback(async (query: string, files?: File[], multiAgent?: boolean, workflow: string = 'feature') => {
    setMessages([]);
    setError(null);
    setIsRunning(true);

    // Add user's query as first message
    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      type: 'text',
      data: { content: query, isUser: true },
      timestamp: Date.now(),
    };
    setMessages([userMessage]);

    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let response: Response;

      if (multiAgent) {
        // Multi-agent workflow
        response = await fetch('/api/multi-agent/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task: query,
            workflow: workflow,
            context: {}
          }),
          signal: abortController.signal,
        });
      } else if (files && files.length > 0) {
        // Run with files
        const formData = new FormData();
        formData.append('query', query);
        formData.append('max_turns', '10');

        files.forEach(file => {
          formData.append('files', file);
        });

        response = await fetch('/api/agent/run-with-files', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });
      } else {
        // Run without files
        response = await fetch('/api/agent/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            max_turns: 10,
          }),
          signal: abortController.signal,
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove 'data: ' prefix
                const event = JSON.parse(jsonStr);

                console.log('📨 Received event:', event.type, event.data);

                const message: AgentMessage = {
                  id: `${Date.now()}-${Math.random()}`,
                  type: event.type,
                  data: event.data,
                  timestamp: Date.now(),
                };

                setMessages(prev => [...prev, message]);

                // Check if done
                if (event.type === 'done') {
                  setIsRunning(false);
                }
              } catch (e) {
                console.error('Failed to parse SSE event:', e);
              }
            }
          }
        } catch (readError: any) {
          // Handle read errors (including aborts)
          if (readError.name === 'AbortError') {
            console.log('Stream aborted by user');
            break;
          }
          throw readError;
        }
      }

      setIsRunning(false);
    } catch (err) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        // Agent stopped by user - silent
      } else {
        console.error('Agent error:', error);
        setError(error.message || 'Unknown error');

        const errorMessage: AgentMessage = {
          id: `${Date.now()}-error`,
          type: 'error',
          data: { message: error.message || 'Failed to run agent' },
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setIsRunning(false);
    }
  }, []);

  const stopAgent = useCallback(() => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (readerRef.current) {
        readerRef.current.cancel().catch(() => {
          // Ignore cancel errors
        });
        readerRef.current = null;
      }
    } catch (err) {
      // Ignore abort errors
      console.log('Agent stopped');
    }

    setIsRunning(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isRunning,
    error,
    runAgent,
    stopAgent,
    clearMessages,
  };
};
