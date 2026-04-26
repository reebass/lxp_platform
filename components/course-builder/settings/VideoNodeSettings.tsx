"use client";

import React, { useState } from 'react';
import { type Node } from '@xyflow/react';
import { Link, Upload, CloudCog, Sparkles } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';
import { Button } from '@/components/ui/Button';

// ---------- types ----------
type Tab = 'link_upload' | 'cloud' | 'ai_avatar';

interface VideoNodeSettingsProps {
  node: Node;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
}

const tabs: { key: Tab; icon: React.ElementType; labelKey: 'tab_link_upload' | 'tab_cloud' | 'tab_ai_avatar' }[] = [
  { key: 'link_upload', icon: Link,     labelKey: 'tab_link_upload' },
  { key: 'cloud',       icon: CloudCog, labelKey: 'tab_cloud' },
  { key: 'ai_avatar',   icon: Sparkles, labelKey: 'tab_ai_avatar' },
];

// ---------- component ----------
export const VideoNodeSettings: React.FC<VideoNodeSettingsProps> = ({ node, updateNodeData }) => {
  const t = dict.uk.course_builder;
  const [activeTab, setActiveTab] = useState<Tab>('link_upload');

  const mediaUrl = (node.data.mediaUrl as string) ?? '';

  return (
    <div className="space-y-3">
      {/* Segmented tab bar */}
      <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
        {tabs.map(({ key, icon: Icon, labelKey }) => (
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

      {/* ============ LINK / UPLOAD TAB ============ */}
      {activeTab === 'link_upload' && (
        <div className="space-y-3">
          {/* URL input */}
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => updateNodeData(node.id, { mediaUrl: e.target.value, mediaSource: 'link' })}
            placeholder={t.input_media_url}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
          />

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.or_upload_file}</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* File upload area */}
          <label className="flex flex-col items-center justify-center py-5 gap-2 rounded-lg border border-dashed border-border/50 bg-muted/5 cursor-pointer hover:border-primary/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Upload size={16} className="text-blue-500" />
            </div>
            <p className="text-[11px] text-muted-foreground">{t.upload_video_hint}</p>
            <input
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) console.log('[VideoNode] File selected:', file.name, `${(file.size / 1e6).toFixed(1)} MB`);
              }}
            />
          </label>
        </div>
      )}

      {/* ============ GOOGLE DRIVE TAB ============ */}
      {activeTab === 'cloud' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 rounded-lg border border-dashed border-border/50 bg-muted/10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CloudCog size={18} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-snug">
            {t.cloud_placeholder}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            {t.badge_coming_soon}
          </span>
        </div>
      )}

      {/* ============ AI AVATAR TAB ============ */}
      {activeTab === 'ai_avatar' && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 rounded-lg border border-dashed border-border/50 bg-muted/10">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Sparkles size={18} className="text-violet-500" />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-snug">
            {t.ai_avatar_placeholder}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30">
            ✦ {t.badge_premium}
          </span>
        </div>
      )}
    </div>
  );
};
