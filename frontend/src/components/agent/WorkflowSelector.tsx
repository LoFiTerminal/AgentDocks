'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Play, Loader2 } from 'lucide-react';

interface WorkflowOption {
  id: string;
  name: string;
  description: string;
  agents: string[];
}

interface WorkflowSelectorProps {
  workflows: WorkflowOption[];
  onRunWorkflow: (workflowId: string, task: string) => Promise<void>;
  isRunning?: boolean;
}

export function WorkflowSelector({ workflows, onRunWorkflow, isRunning }: WorkflowSelectorProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('feature');
  const [task, setTask] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || isRunning) return;

    await onRunWorkflow(selectedWorkflow, task);
  };

  const selectedWorkflowData = workflows.find(w => w.id === selectedWorkflow);

  return (
    <div className="border border-border rounded-lg p-2 bg-background">
      <div className="flex items-center gap-2 mb-2">
        <Workflow className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Workflow</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Workflow Selection */}
        <div>
          <label className="text-xs font-medium mb-1 block">
            Select Workflow
          </label>
          <div className="grid grid-cols-1 gap-1">
            {workflows.map(workflow => (
              <button
                key={workflow.id}
                type="button"
                onClick={() => setSelectedWorkflow(workflow.id)}
                className={`
                  px-2 py-1 rounded-lg border text-xs font-medium
                  transition-colors
                  ${
                    selectedWorkflow === workflow.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-border hover:border-amber-500/50'
                  }
                `}
              >
                {workflow.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Workflow Info - Hidden to save space */}

        {/* Task Input */}
        <div>
          <label className="text-xs font-medium mb-1 block">
            Task
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What to build..."
            className="
              w-full px-2 py-1 rounded-lg text-xs
              border border-border
              bg-background
              focus:outline-none focus:ring-1 focus:ring-amber-500
              resize-none
            "
            rows={2}
            disabled={isRunning}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!task.trim() || isRunning}
          className="
            w-full px-2 py-1 rounded-lg text-xs
            bg-amber-500 hover:bg-amber-600
            text-black font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            flex items-center justify-center gap-1
          "
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>Start Workflow</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
