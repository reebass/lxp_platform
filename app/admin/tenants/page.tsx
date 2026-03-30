import React from 'react';
import { dict } from '@/lib/i18n/dictionaries';
import { Users } from 'lucide-react';
import { EmptyTenants } from '@/components/admin/tenants/EmptyTenants';
import { TenantsGrid, Tenant } from '@/components/admin/tenants/TenantsGrid';
import { AddTenantModal } from '@/components/admin/tenants/AddTenantModal';
import { createClient } from '@/lib/supabase/server';

// Серверный компонент (Server Component). 
// Выполняется только на сервере перед отправкой HTML клиенту.
// Теперь он отвечает ИСКЛЮЧИТЕЛЬНО за получение данных (fetch) из Supabase SSR.
export default async function TenantsPage() {
  const d = dict.uk.admin.tenantsPage;

  // Централизованная инициализация Supabase
  const supabase = await createClient();

  // Мы используем select('*') для гарантированного извлечения абсолютно всех колонок,
  // включая добавленные subdomain и corporate_domain, чтобы не пропустить ни одного поля при расширении схемы.
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase fetch error for tenants:", error);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Users className="text-primary mr-3" size={32} />
          {d.title}
        </h1>
        <div className="w-full md:w-auto flex items-center justify-center">
          <AddTenantModal />
        </div>
      </div>

      {/* Инъекция UI презентационных компонентов */}
      {!tenants || tenants.length === 0 ? (
        <EmptyTenants />
      ) : (
        <TenantsGrid tenants={tenants as Tenant[]} />
      )}
    </div>
  );
}
