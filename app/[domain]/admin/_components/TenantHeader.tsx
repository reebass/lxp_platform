"use client";

import React from 'react';
import Link from 'next/link';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { dict } from '@/lib/i18n/dictionaries';

// Tenant Admin Header — mirrors Super Admin's AdminHeader.
// Clicking the title navigates to the tenant admin root (/admin).
export const TenantHeader = () => {
  const d = dict.uk.tenant_admin;

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-10 w-full shadow-md shadow-primary/5 shrink-0">
      <Link
        href="/admin"
        className="transition-all duration-200 hover:text-primary hover:drop-shadow-[0_0_8px_currentColor] active:text-primary active:drop-shadow-[0_0_8px_currentColor]"
      >
        <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">
          {d.header_title}
        </h1>
      </Link>
      <LogoutButton label={d.logout} />
    </header>
  );
};
