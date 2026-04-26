"use client";

import React from 'react';
import {
  FileText,
  PlaySquare,
  Headphones,
  ListChecks,
  ArrowLeft,
} from 'lucide-react';
import { type Node } from '@xyflow/react';
import { dict } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/Button';
import { TextNodeSettings } from './settings/TextNodeSettings';
import { VideoNodeSettings } from './settings/VideoNodeSettings';
import { AudioNodeSettings } from './settings/AudioNodeSettings';
import { QuizNodeSettings } from './settings/QuizNodeSettings';

// ---------- constants ----------
const sidebarItems = [
  { type: 'pdf', icon: FileText, colorClass: 'text-primary', bgClass: 'bg-primary/10' },
  { type: 'video', icon: PlaySquare, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
  { type: 'audio', icon: Headphones, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  { type: 'quiz', icon: ListChecks, colorClass: 'text-violet-500', bgClass: 'bg-violet-500/10' },
] as const;

const titleKey: Record<string, 'node_pdf_title' | 'node_video_title' | 'node_audio_title' | 'node_quiz_title'> = {
  pdf: 'node_pdf_title',
  video: 'node_video_title',
  audio: 'node_audio_title',
  quiz: 'node_quiz_title',
};

const descKey: Record<string, 'node_pdf_desc' | 'node_video_desc' | 'node_audio_desc' | 'node_quiz_desc'> = {
  pdf: 'node_pdf_desc',
  video: 'node_video_desc',
  audio: 'node_audio_desc',
  quiz: 'node_quiz_desc',
};

// ---------- types ----------
interface CourseBuilderSidebarProps {
  selectedNode?: Node;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  deselectAll: () => void;
}

// ---------- Toolbox view (default) ----------
const SidebarToolbox = () => {
  const t = dict.uk.course_builder;

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <>
      <div className="px-4 py-4 border-b border-border/30">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {t.sidebar_title}
        </h2>
      </div>

      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {sidebarItems.map(({ type, icon: Icon, colorClass, bgClass }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 bg-background hover:border-primary/40 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none"
          >
            <div className={`shrink-0 w-8 h-8 rounded-md ${bgClass} flex items-center justify-center`}>
              <Icon size={16} className={colorClass} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight">
                {t[titleKey[type]]}
              </p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                {t[descKey[type]]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ---------- Settings view (selected node) ----------
const SidebarSettings: React.FC<{
  node: Node;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  deselectAll: () => void;
}> = ({ node, updateNodeData, deselectAll }) => {
  const t = dict.uk.course_builder;

  return (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="minimal" onClick={deselectAll} className="!px-2 !py-1 text-xs gap-1.5">
            <ArrowLeft size={14} />
            {t.btn_back}
          </Button>
        </div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {t.sidebar_settings}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {node.data.label as string}
        </p>
      </div>

      {/* Settings form */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Node Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="node-name"
            className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
          >
            {t.input_node_name}
          </label>
          <input
            id="node-name"
            type="text"
            value={node.data.label as string}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
          />
        </div>

        {/* Type-specific settings */}
        {node.type === 'pdf' && (
          <TextNodeSettings node={node} updateNodeData={updateNodeData} />
        )}
        {node.type === 'video' && (
          <VideoNodeSettings node={node} updateNodeData={updateNodeData} />
        )}
        {node.type === 'audio' && (
          <AudioNodeSettings node={node} updateNodeData={updateNodeData} />
        )}
        {node.type === 'quiz' && (
          <QuizNodeSettings node={node} updateNodeData={updateNodeData} />
        )}
      </div>
    </>
  );
};

// ---------- Main sidebar component ----------
export const CourseBuilderSidebar: React.FC<CourseBuilderSidebarProps> = ({
  selectedNode,
  updateNodeData,
  deselectAll,
}) => {
  const isEditing = !!selectedNode;

  return (
    <aside className={`${isEditing ? 'w-96' : 'w-64'} shrink-0 border-l border-border/40 bg-background/60 backdrop-blur-sm flex flex-col transition-[width] duration-300 ease-in-out`}>
      {selectedNode ? (
        <SidebarSettings
          node={selectedNode}
          updateNodeData={updateNodeData}
          deselectAll={deselectAll}
        />
      ) : (
        <SidebarToolbox />
      )}
    </aside>
  );
};
