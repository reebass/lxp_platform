import React from 'react';
import { Card } from '@/components/ui/Card';
import { Users } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

// Изолированный презентационный компонент пустого состояния.
// Выделен из page.tsx для следования паттерну Atomic Design (Организм).
export const EmptyTenants = () => {
  const d = dict.uk.admin.tenantsPage;

  return (
    <Card className="flex flex-col items-center justify-center p-16 mt-8 border-dashed border-2 border-border bg-background/50">
      <Users className="text-muted-foreground mb-4 opacity-50" size={64} />
      <h2 className="text-xl text-foreground opacity-80 font-medium text-center">{d.emptyState}</h2>
    </Card>
  );
};
