"use client";

import React, { memo } from 'react';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { Headphones, Settings, X } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';
import { useEditingContext } from '../CourseBuilderContext';

// Custom React Flow node for Audio content (podcasts, lectures, etc.).
const AudioNode = memo(({ id, data }: NodeProps) => {
  const t = dict.uk.course_builder;
  const { setNodes, setEdges } = useReactFlow();
  const { setEditingNodeId } = useEditingContext();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  return (
    <div className="group relative bg-background border border-amber-400/50 rounded-lg shadow-sm px-2.5 py-1.5 min-w-[140px] max-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !w-2.5 !h-2.5 !border-2 !border-background"
      />

      {/* Action toolbar — visible on hover */}
      <div className="absolute -top-1 -right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={handleEdit}
          className="w-5 h-5 rounded-md bg-background border border-border/60 flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        >
          <Settings size={10} className="text-muted-foreground" />
        </button>
        <button
          onClick={handleDelete}
          className="w-5 h-5 rounded-md bg-background border border-border/60 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/40 transition-colors shadow-sm"
        >
          <X size={10} className="text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="shrink-0 w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
          <Headphones size={13} className="text-amber-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground leading-tight truncate">
            {data.label as string}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-px truncate">
            {t.node_audio_desc}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-500 !w-2.5 !h-2.5 !border-2 !border-background"
      />
    </div>
  );
});

AudioNode.displayName = 'AudioNode';
export { AudioNode };
