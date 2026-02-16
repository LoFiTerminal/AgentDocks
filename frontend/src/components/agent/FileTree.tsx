'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { clsx } from 'clsx';

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: TreeNode[];
}

interface FileTreeProps {
  tree: TreeNode;
  onFileClick: (path: string) => void;
}

export const FileTree = ({ tree, onFileClick }: FileTreeProps) => {
  return (
    <div className="h-full overflow-y-auto p-2">
      <TreeNodeComponent node={tree} onFileClick={onFileClick} level={0} />
    </div>
  );
};

interface TreeNodeComponentProps {
  node: TreeNode;
  onFileClick: (path: string) => void;
  level: number;
}

const TreeNodeComponent = ({ node, onFileClick, level }: TreeNodeComponentProps) => {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const handleClick = () => {
    if (node.type === 'directory') {
      setExpanded(!expanded);
    } else {
      onFileClick(node.path);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={clsx(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-secondary/50 transition-colors text-left',
          'text-sm group'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.type === 'directory' && (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )
        )}

        {node.type === 'directory' ? (
          <Folder className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
        ) : (
          <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}

        <span className="truncate flex-1">{node.name}</span>

        {node.type === 'file' && node.size && (
          <span className="text-xs text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatSize(node.size)}
          </span>
        )}
      </button>

      {node.type === 'directory' && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.path}
              node={child}
              onFileClick={onFileClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
