import React from 'react';
import { dict } from '@/lib/i18n/dictionaries';
import { LogoutButton } from './LogoutButton';
import Link from 'next/link';

export const AdminHeader = () => {
  const d = dict.uk.admin;

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 z-10 w-full shadow-md shadow-primary/5">
      <Link href="/admin" className="transition-all duration-200 hover:text-primary hover:drop-shadow-[0_0_8px_currentColor] active:text-primary active:drop-shadow-[0_0_8px_currentColor]">
        <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{d.header}</h1>
      </Link>
      <LogoutButton label={d.logout} />
    </header>
  );
};
