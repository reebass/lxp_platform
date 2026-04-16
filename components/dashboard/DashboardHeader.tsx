"use client";

// components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { dict } from '@/lib/i18n/dictionaries';
import { Search } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const t = dict.uk.dashboard;
  const ai = dict.uk.ai_assistant;

  return (
    // Делаем шапку жестко фиксированной (fixed top-0) и растянутой на всю ширину (w-full).
    // z-50 и backdrop-blur-md гарантируют, что она всегда поверх контента и красиво размывает его.
    <header className="fixed top-0 left-0 w-full h-20 px-4 md:px-8 bg-background/90 backdrop-blur-md border-b border-border z-50 flex justify-between items-center">
      <div>
        <h1 className="font-bold text-xl text-foreground drop-shadow-[0_0_8px_hsl(var(--primary))]">{t.headerTitle}</h1>
      </div>

      {/* Место для инъекции корпоративного логотипа клиента в будущем */}
      <div id="tenant-logo-placeholder" className="hidden md:block flex-1"></div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block w-70">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-spotlight'));
              }
            }}
            className="cursor-text w-full flex items-center justify-between bg-muted/30 hover:bg-muted/60 border border-border/40 text-muted-foreground rounded-full px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 opacity-70" />
              <span className="opacity-80 truncate text-[12px]">{ai.search_trigger}</span>
            </div>
            <kbd className="hidden sm:inline-flex shrink-0 items-center gap-0.5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground border border-border/60 rounded bg-background/50 shadow-sm opacity-80">
              <span className="text-[11px]">Ctrl+</span>Space
            </kbd>
          </button>
        </div>

        <LogoutButton label={t.logout} />
      </div>
    </header>
  );
};
