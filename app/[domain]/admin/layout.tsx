import React from 'react';
import { TenantSidebar } from './_components/TenantSidebar';
import { TenantHeader } from './_components/TenantHeader';

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Smart Sidebar (w-16 collapsed, w-64 expanded) */}
      <TenantSidebar />

      {/* Right-side container: header + page content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 transition-all duration-300">
        {/* Top Header */}
        <TenantHeader />

        {/* Active page */}
        <main className="flex-1 bg-content relative z-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
