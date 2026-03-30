'use client';

import React from 'react';
import { LogoutButton } from '@/components/admin/LogoutButton';

export const DataHubHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Data Hub / База знань
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Централізоване сховище знань вашої компанії для навчання ШІ-аватара.
        </p>
      </div>

      <div className="flex items-center justify-end w-full sm:w-auto">
        <LogoutButton label="Вийти" />
      </div>
    </div>
  );
};
