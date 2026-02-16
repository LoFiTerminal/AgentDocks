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
    <div className="border border-border rounded-lg p-4 bg-background">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold">Multi-Agent Workflow</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workflow Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Workflow
          </label>
          <div className="grid grid-cols-3 gap-2">
            {workflows.map(workflow => (
              <button
                key={workflow.id}
                type="button"
                onClick={() => setSelectedWorkflow(workflow.id)}
                className={`
                  px-4 py-2 rounded-lg border text-sm font-medium
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

        {/* Selected Workflow Info */}
        {selectedWorkflowData && (
          <motion.div
            key={selectedWorkflow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 rounded-lg p-3 space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              {selectedWorkflowData.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Agents:
              </span>
              {selectedWorkflowData.agents.map((agent, index) => (
                <span key={agent} className="flex items-center">
                  <span className="text-xs px-2 py-1 rounded-full bg-background capitalize">
                    {agent}
                  </span>
                  {index < selectedWorkflowData.agents.length - 1 && (
                    <span className="text-muted-foreground mx-1">→</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Task Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Task Description
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what you want the agents to do..."
            className="
              w-full px-3 py-2 rounded-lg
              border border-border
              bg-background
              focus:outline-none focus:ring-2 focus:ring-amber-500
              resize-none
            "
            rows={3}
            disabled={isRunning}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!task.trim() || isRunning}
          className="
            w-full px-4 py-2 rounded-lg
            bg-amber-500 hover:bg-amber-600
            text-black font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Workflow...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Workflow
            </>
          )}
        </button>
      </form>
    </div>
  );
}
