import React from 'react';
import { Card } from '@/components/ui/Card';
import { dict } from '@/lib/i18n/dictionaries';
import Link from 'next/link';

// Интерфейс для типизации массива клиентов, приходящих из Supabase
export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  subdomain?: string | null;
  corporate_domain?: string | null;
  logo_url?: string | null; // Добавляем поле логотипа для рендеринга в списке
}

interface TenantsGridProps {
  tenants: Tenant[];
}

// Компонент сетки (Grid). Отвечает исключительно за UI рендер.
// Оставляет серверный компонент page.tsx чистым (занимающимся только fetch-логикой).
export const TenantsGrid = ({ tenants }: TenantsGridProps) => {
  const d = dict.uk.admin.tenantsPage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {tenants.map((tenant) => (
        <Link href={`/admin/tenants/${tenant.id}`} key={tenant.id} className="block w-full outline-none focus:ring-2 focus:ring-primary rounded-xl">
          <Card className="relative h-full overflow-hidden border border-graphite hover:border-primary/50 cursor-pointer hover:shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300 group">
            <div className="absolute left-0 top-0 h-full w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center mb-4 pr-4 overflow-hidden">
              {/* 
                УМНЫЙ РЕНДЕРИНГ ЛОГОТИПА: 
                Если в БД есть logo_url, мы отображаем его как компактный аватар.
                Если логотипа нет (null/undefined), возвращаемся к текстовому названию.
              */}
              {tenant.logo_url ? (
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="h-10 w-10 rounded-full object-contain bg-background border border-graphite p-1 shadow-sm"
                  />
                </div>
              ) : null}

              <h3 className="text-xl font-bold text-foreground truncate">
                {tenant.name || d.grid.unnamedTenant}
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-medium mr-4">{d.card.id}</span>
                <span className="text-primary truncate" title={tenant.id}>{tenant.id.substring(0, 8)}...</span>
              </div>

              {/* Отрисовываем сабдомены только если они были заполнены при создании */}
              {tenant.subdomain && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-medium mr-4">{d.grid.subdomain}</span>
                  <span className="text-foreground truncate">{tenant.subdomain}</span>
                </div>
              )}

              {tenant.corporate_domain && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-medium mr-4">{d.grid.email}</span>
                  <span className="text-foreground truncate">{tenant.corporate_domain}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-muted-foreground mt-4">
                <span className="font-medium">{d.card.created}</span>
                <span className="text-foreground">{new Date(tenant.created_at).toLocaleDateString('uk-UA')}</span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
