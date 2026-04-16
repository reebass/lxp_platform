"use client";

import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { dict } from '@/lib/i18n/dictionaries';

interface CourseBuilderCanvasProps {
  mode: 'master' | 'tenant';
  onSave: (flowData: { nodes: Node[]; edges: Edge[] }) => void;
}

export const CourseBuilderCanvas: React.FC<CourseBuilderCanvasProps> = ({ mode, onSave }) => {
  // TODO: Dynamically select locale later. Using 'uk' for now.
  const t = dict.uk.course_builder;

  const initialNodes: Node[] = [
    {
      id: 'start',
      type: 'input',
      data: { label: t.node_start },
      position: { x: 250, y: 50 },
      deletable: false,
      style: {
        background: '#d1fae5',
        border: '2px solid #10b981',
        borderRadius: '10px',
        padding: '10px 20px',
        fontWeight: 600,
        color: '#065f46',
      },
    },
    {
      id: 'finish',
      type: 'output',
      data: { label: t.node_finish },
      position: { x: 250, y: 250 },
      deletable: false,
      style: {
        background: '#fee2e2',
        border: '2px solid #ef4444',
        borderRadius: '10px',
        padding: '10px 20px',
        fontWeight: 600,
        color: '#7f1d1d',
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: 'start-finish',
      source: 'start',
      target: 'finish',
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  );

  const handleSave = () => {
    onSave({ nodes, edges });
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[600px]">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-border/40 bg-background/60 backdrop-blur-sm flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground px-2">Mode: {mode}</span>
          <button className="px-4 py-2 text-sm font-medium border border-border/60 rounded-lg text-muted-foreground hover:bg-muted/40 transition-colors">
            {t.btn_reset}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            {t.btn_save}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full flex-1 relative min-h-[500px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
          attributionPosition="bottom-right"
          className="bg-background-content"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--border))"
          />
          <Controls className="[&>button]:bg-background [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-muted" />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'input') return '#10b981';
              if (node.type === 'output') return '#ef4444';
              return 'hsl(var(--primary))';
            }}
            maskColor="hsl(var(--background) / 0.7)"
            className="!bg-background border border-border/40 rounded-xl overflow-hidden shadow-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
