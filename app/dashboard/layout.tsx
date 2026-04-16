import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SpotlightChat } from '@/components/ai/SpotlightChat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-content flex flex-col relative z-0 overflow-auto">
      <DashboardHeader />
      {/* 
        Padding добавлен ИСКЛЮЧИТЕЛЬНО на main.
        pt-24 lg:pt-32 критически важны (top padding), чтобы контент не заезжал 
        под фиксированную шапку (fixed), которая вырвана из потока документа. 
      */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pt-24 lg:pt-32">
        {children}
      </main>
      <SpotlightChat tenantId={null} />
    </div>
  );
}
