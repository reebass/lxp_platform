"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { dict } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/Dialog';
import { PdfNode } from './nodes/PdfNode';
import { VideoNode } from './nodes/VideoNode';
import { AudioNode } from './nodes/AudioNode';
import { QuizNode } from './nodes/QuizNode';
import { CourseBuilderSidebar } from './CourseBuilderSidebar';
import { EditingContext } from './CourseBuilderContext';
import { useCourseSync } from './hooks/useCourseSync';

// ---------- helpers ----------
const getId = (type: string) => `${type}_${crypto.randomUUID().slice(0, 8)}`;

// ---------- types ----------
interface CourseBuilderCanvasProps {
  mode: 'master' | 'tenant';
  courseId?: string | null;
  initialFlowData?: { nodes: Node[]; edges: Edge[] } | null;
  loadError?: string | null;
}

// ---------- default nodes (used when no saved data) ----------
const createDefaultNodes = (t: typeof dict.uk.course_builder): Node[] => [
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

// ---------- inner component (needs ReactFlowProvider above it) ----------
const CourseBuilderInner: React.FC<CourseBuilderCanvasProps> = ({
  mode,
  courseId: initialCourseId,
  initialFlowData,
  loadError,
}) => {
  const t = dict.uk.course_builder;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Show toast if course couldn't be loaded
  useEffect(() => {
    if (loadError) {
      toast.error(loadError);
    }
  }, [loadError]);
  const { screenToFlowPosition } = useReactFlow();

  // Map node type → default base name for auto-naming
  const defaultNames: Record<string, string> = useMemo(() => ({
    pdf: t.default_name_pdf,
    video: t.default_name_video,
    audio: t.default_name_audio,
    quiz: t.default_name_quiz,
  }), [t]);

  // Hydrate from DB or use defaults
  const startNodes = initialFlowData?.nodes ?? createDefaultNodes(t);
  const startEdges = initialFlowData?.edges ?? [];

  const [nodes, setNodes, onNodesChange] = useNodesState(startNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(startEdges);

  const nodeTypes = useMemo(() => ({
    pdf: PdfNode,
    video: VideoNode,
    audio: AudioNode,
    quiz: QuizNode,
  }), []);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  );

  // ---- Drag & Drop handlers ----
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) => {
        const count = nds.filter((n) => n.type === type).length;
        const baseName = defaultNames[type] ?? type;
        const newNode: Node = {
          id: getId(type),
          type,
          position,
          data: { label: `${baseName} ${count + 1}` },
        };
        return [...nds, newNode];
      });
    },
    [screenToFlowPosition, setNodes, defaultNames],
  );

  // ---- Editing state (decoupled from native selection) ----
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const editingNode = editingNodeId ? nodes.find((n) => n.id === editingNodeId) : undefined;

  const updateNodeData = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
      );
    },
    [setNodes],
  );

  const closeSettings = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  // ---- Persistence ----
  const { isPending, save } = useCourseSync(initialCourseId ?? null);

  const handleSave = () => {
    save({ nodes, edges });
  };

  // ---- Reset ----
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleReset = () => {
    setNodes(createDefaultNodes(t));
    setEdges([]);
    setEditingNodeId(null);
    setShowResetDialog(false);
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
          <Button variant="minimal" className="border-[0.5px] border-foreground/40" onClick={() => setShowResetDialog(true)}>
            {t.btn_reset}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isPending}>
            {isPending ? t.btn_saving : t.btn_save}
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.confirm_reset_title}</DialogTitle>
            <DialogDescription>{t.confirm_reset_description}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 px-6 py-6 transition-all">
            <DialogClose asChild>
              <Button variant="primary">
                {t.btn_cancel}
              </Button>
            </DialogClose>
            <Button
              variant="minimal"
              onClick={handleReset}
              className="border-[0.5px] border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
            >
              {t.btn_confirm_reset}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar + Canvas row */}
      <div className="flex flex-row flex-1 min-h-0">

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <EditingContext.Provider value={{ editingNodeId, setEditingNodeId }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
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
          </EditingContext.Provider>
        </div>

        <CourseBuilderSidebar
          selectedNode={editingNode}
          updateNodeData={updateNodeData}
          deselectAll={closeSettings}
        />
      </div>
    </div>
  );
};

// ---------- public wrapper (provides ReactFlowProvider) ----------
export const CourseBuilderCanvas: React.FC<CourseBuilderCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CourseBuilderInner {...props} />
    </ReactFlowProvider>
  );
};
