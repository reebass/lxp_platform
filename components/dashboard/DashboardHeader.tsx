// components/dashboard/DashboardHeader.tsx
import React from 'react';
import { LogoutButton } from '@/components/admin/LogoutButton';

export const DashboardHeader: React.FC = () => {
  return (
    // Делаем шапку жестко фиксированной (fixed top-0) и растянутой на всю ширину (w-full).
    // z-50 и backdrop-blur-md гарантируют, что она всегда поверх контента и красиво размывает его.
    <header className="fixed top-0 left-0 w-full h-20 px-4 md:px-8 bg-background/90 backdrop-blur-md border-b border-border z-50 flex justify-between items-center">
      <div>
        <h1 className="font-bold text-xl text-foreground drop-shadow-[0_0_8px_hsl(var(--primary))]">Твій план розвитку</h1>
      </div>
      
      {/* Место для инъекции корпоративного логотипа клиента в будущем */}
      <div id="tenant-logo-placeholder" className="hidden md:block"></div>

      <div>
        <LogoutButton label="Вийти" />
      </div>
    </header>
  );
};
