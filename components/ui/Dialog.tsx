'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React from 'react';

// ---------------------------------------------------------------------------
// Shared accessible Dialog / Modal built on @radix-ui/react-dialog.
// Exports thin wrappers so consumers don't import radix directly.
// ---------------------------------------------------------------------------

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      {/* Backdrop */}
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

      {/* Panel */}
      <RadixDialog.Content
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2
          rounded-2xl border border-border/60 bg-content shadow-2xl shadow-black/60
          focus:outline-none
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
          data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
          duration-200 ${className}`}
        {...props}
      >
        {/* Close button */}
        <RadixDialog.Close className="absolute cursor-pointer right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40">
          <X className="w-4 h-4" />
          <span className="sr-only">Закрити</span>
        </RadixDialog.Close>

        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-6 pb-4 border-b border-border/40">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <RadixDialog.Title className="text-lg font-semibold text-foreground">
      {children}
    </RadixDialog.Title>
  );
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <RadixDialog.Description className="text-sm text-muted-foreground mt-1">
      {children}
    </RadixDialog.Description>
  );
}
