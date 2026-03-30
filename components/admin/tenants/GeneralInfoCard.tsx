import React from 'react';
import { Card } from '@/components/ui/Card';
import { Building } from 'lucide-react';

// Atomic Design: Мы создаем узкоспециализированные, переиспользуемые организмы (Organisms).
// Этот компонент отвечает исключительно за отображение общей информации о клиенте (Tenant),
// изолируя собственную структуру данных от остального макета страницы.
export function GeneralInfoCard({ tenant }: { tenant: any }) {
  return (
    <Card className="h-full border border-border bg-content overflow-hidden relative group hover:border-primary/50 transition-colors">
      <div className="absolute left-0 top-0 h-full w-1 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <h3 className="text-xl font-bold text-primary mb-6 flex items-center">
        <Building className="mr-3" size={24} />
        Загальна інформація
      </h3>
      <div className="space-y-4 text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground font-medium mb-1">ID Клієнта</span>
          <span className="text-foreground text-opacity-90 font-mono text-xs break-all bg-gray-900/50 p-2 rounded border border-gray-800">{tenant.id}</span>
        </div>
        {(tenant.subdomain || tenant.corporate_domain) && (
          <div className="w-full h-px bg-graphite my-2"></div>
        )}
        {tenant.subdomain && (
          <div className="flex justify-between items-center bg-background p-2 rounded-md">
            <span className="text-muted-foreground font-medium">Сабдомен:</span>
            <span className="text-foreground font-semibold bg-primary/10 px-2 py-1 rounded text-primary">{tenant.subdomain}</span>
          </div>
        )}
        {tenant.corporate_domain && (
          <div className="flex justify-between items-center bg-background p-2 rounded-md">
            <span className="text-muted-foreground font-medium">Пошта:</span>
            <span className="text-foreground font-semibold">{tenant.corporate_domain}</span>
          </div>
        )}
        <div className="w-full h-px bg-graphite my-2"></div>
        <div className="flex items-center justify-between text-muted-foreground pt-2">
          <span className="font-medium">Створено:</span>
          <span className="text-foreground">{new Date(tenant.created_at).toLocaleDateString('uk-UA')}</span>
        </div>
      </div>
    </Card>
  );
}
