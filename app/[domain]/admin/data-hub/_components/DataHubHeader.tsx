'use client';

import React from 'react';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { dict } from '@/lib/i18n/dictionaries';

export const DataHubHeader = () => {
  const d = dict.uk.dataHub.header;

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          {d.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {d.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-end w-full sm:w-auto">
        <LogoutButton label={d.logout} />
      </div>
    </div>
  );
};
