'use client';

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import React from 'react';

// ---------------------------------------------------------------------------
// Thin wrappers around @radix-ui/react-dropdown-menu — same pattern as Dialog.tsx
// ---------------------------------------------------------------------------

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

export function DropdownMenuContent({
  children,
  className = '',
  sideOffset = 4,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={`z-50 min-w-[148px] overflow-hidden rounded-lg border border-border/60
          bg-background shadow-xl shadow-black/50
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2
          duration-150 ${className}`}
        {...props}
      >
        {children}
      </DropdownPrimitive.Content>
    </DropdownPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none
        text-foreground hover:bg-primary/10 hover:text-primary
        focus:bg-primary/10 focus:text-primary
        data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        transition-colors ${className}`}
      {...props}
    >
      {children}
    </DropdownPrimitive.Item>
  );
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="h-px bg-border/40 my-1" />;
}
