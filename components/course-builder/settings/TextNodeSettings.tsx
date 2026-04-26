"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { type Node } from '@xyflow/react';
import { toast } from 'sonner';
import {
  PenLine, Upload, Sparkles,
  Plus, X, ImagePlus,
  AlignLeft, ListOrdered, Lightbulb,
  Loader2,
} from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/Button';
import { generateNodeContentAction } from '@/app/actions/ai.actions';

// ---------- types ----------
type Tab = 'manual' | 'upload' | 'ai';

interface Slide {
  id: string;
  text: string;
  imageUrl: string | null;
}

interface TextNodeSettingsProps {
  node: Node;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
}

const contentTabs: { key: Tab; icon: React.ElementType; labelKey: 'tab_manual' | 'tab_upload' | 'tab_ai' }[] = [
  { key: 'manual', icon: PenLine,  labelKey: 'tab_manual' },
  { key: 'upload', icon: Upload,   labelKey: 'tab_upload' },
  { key: 'ai',     icon: Sparkles, labelKey: 'tab_ai' },
];

// ---------- helpers ----------
let slideIdCounter = 0;
const newSlideId = () => `slide_${Date.now()}_${++slideIdCounter}`;

const createEmptySlide = (): Slide => ({ id: newSlideId(), text: '', imageUrl: null });

const DEFAULT_SLIDES: Slide[] = [createEmptySlide()];

// ---------- component ----------
export const TextNodeSettings: React.FC<TextNodeSettingsProps> = ({ node, updateNodeData }) => {
  const t = dict.uk.course_builder;
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Always derive a safe slides array — never undefined
  const raw = node.data.slides as Slide[] | undefined;
  const slides: Slide[] = raw && Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_SLIDES;

  // Auto-init: persist default slides into node data if missing
  useEffect(() => {
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      updateNodeData(node.id, { slides: DEFAULT_SLIDES });
    }
  }, [raw, node.id, updateNodeData]);

  // Clamp slide index when slides are removed
  useEffect(() => {
    if (activeSlideIdx >= slides.length) {
      setActiveSlideIdx(Math.max(0, slides.length - 1));
    }
  }, [slides.length, activeSlideIdx]);

  const clampedIdx = Math.min(activeSlideIdx, slides.length - 1);
  const currentSlide = slides[clampedIdx];

  // ---- Slide mutations ----
  const updateSlideText = (text: string) => {
    const updated = slides.map((s, i) => (i === clampedIdx ? { ...s, text } : s));
    updateNodeData(node.id, { slides: updated });
  };

  const addSlide = () => {
    const updated = [...slides, createEmptySlide()];
    updateNodeData(node.id, { slides: updated });
    setActiveSlideIdx(updated.length - 1);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idx);
    updateNodeData(node.id, { slides: updated });
    if (activeSlideIdx >= updated.length) setActiveSlideIdx(updated.length - 1);
  };

  // ---- AI actions (real) ----
  const handleAiAction = (action: 'summarize' | 'format_steps' | 'suggest_title') => {
    if (!currentSlide.text.trim()) {
      toast.warning(t.ai_empty_slide);
      return;
    }

    startTransition(async () => {
      const res = await generateNodeContentAction(currentSlide.text, action);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.result) {
        if (action === 'suggest_title') {
          // Update the node label on the canvas
          updateNodeData(node.id, { label: res.result });
        } else {
          // Replace current slide text with AI output
          updateSlideText(res.result);
        }
        toast.success(t.toast_ai_success);
      }
    });
  };

  const handleGenerateImage = () => {
    console.log(`[AI Image] Generate for slide ${clampedIdx + 1}:`, currentSlide.text.slice(0, 80));
  };

  return (
    <div className="space-y-3">
      {/* Segmented tab bar */}
      <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
        {contentTabs.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={12} />
            {t[labelKey]}
          </button>
        ))}
      </div>

      {/* ============ MANUAL TAB ============ */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          {/* Slides pagination */}
          <div className="flex items-center gap-1 flex-wrap">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`group/pill relative flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 ${
                  idx === clampedIdx
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-muted/30 text-muted-foreground border border-border/40 hover:text-foreground hover:border-border/60'
                }`}
                onClick={() => setActiveSlideIdx(idx)}
              >
                {t.slide} {idx + 1}
                {slides.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSlide(idx); }}
                    className="opacity-0 group-hover/pill:opacity-100 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-all"
                  >
                    <X size={8} className="text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSlide}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground border border-dashed border-border/50 hover:text-foreground hover:border-primary/40 transition-all"
            >
              <Plus size={10} />
              {t.add_slide}
            </button>
          </div>

          {/* Textarea for current slide */}
          <textarea
            value={currentSlide.text}
            onChange={(e) => updateSlideText(e.target.value)}
            placeholder={t.content_placeholder}
            rows={7}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all leading-relaxed"
          />

          {/* AI Assistant toolbar */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="minimal"
              className="!px-2 !py-1 text-[10px] gap-1"
              onClick={() => handleAiAction('summarize')}
              disabled={isPending}
            >
              {isPending ? <Loader2 size={10} className="animate-spin" /> : <AlignLeft size={10} />}
              {isPending ? t.ai_generating : t.btn_summarize}
            </Button>
            <Button
              variant="minimal"
              className="!px-2 !py-1 text-[10px] gap-1"
              onClick={() => handleAiAction('format_steps')}
              disabled={isPending}
            >
              {isPending ? <Loader2 size={10} className="animate-spin" /> : <ListOrdered size={10} />}
              {isPending ? t.ai_generating : t.btn_format_steps}
            </Button>
            <Button
              variant="minimal"
              className="!px-2 !py-1 text-[10px] gap-1"
              onClick={() => handleAiAction('suggest_title')}
              disabled={isPending}
            >
              {isPending ? <Loader2 size={10} className="animate-spin" /> : <Lightbulb size={10} />}
              {isPending ? t.ai_generating : t.btn_suggest_title}
            </Button>
          </div>

          {/* Image generation placeholder */}
          <div className="flex flex-col items-center justify-center py-5 gap-2.5 rounded-lg border border-dashed border-border/50 bg-muted/5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ImagePlus size={16} className="text-primary" />
            </div>
            <Button variant="minimal" className="text-[11px] gap-1.5 border-[0.5px] border-foreground/20" onClick={handleGenerateImage}>
              <Sparkles size={10} />
              {t.btn_generate_image}
            </Button>
          </div>
        </div>
      )}

      {/* ============ UPLOAD TAB ============ */}
      {activeTab === 'upload' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 rounded-lg border border-dashed border-border/50 bg-muted/10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload size={18} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-snug">
            {t.upload_placeholder}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            {t.badge_coming_soon}
          </span>
        </div>
      )}

      {/* ============ AI TAB ============ */}
      {activeTab === 'ai' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 rounded-lg border border-dashed border-border/50 bg-muted/10">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Sparkles size={18} className="text-violet-500" />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-snug">
            {t.ai_placeholder}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            {t.badge_coming_soon}
          </span>
        </div>
      )}
    </div>
  );
};
