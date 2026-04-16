import React from 'react';
import { dict } from '@/lib/i18n/dictionaries';
import { Users, Database } from 'lucide-react';
import { EmptyTenants } from '@/components/admin/tenants/EmptyTenants';
import { TenantsGrid, Tenant } from '@/components/admin/tenants/TenantsGrid';
import { AddTenantModal } from '@/components/admin/tenants/AddTenantModal';
import { createClient } from '@/lib/supabase/server';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Ліміт Supabase Storage (Buckets) на безкоштовному тарифі — 1 ГБ.
const PLATFORM_STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB

// Серверный компонент (Server Component). 
// Выполняется только на сервере перед отправкой HTML клиенту.
export default async function TenantsPage() {
  const d = dict.uk.admin.tenantsPage;
  const supabase = await createClient();

  // Основний запит: список усіх тенантів
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  // Глобальна статистика сховища: сума size_bytes по всіх документах платформи
  const { data: storageData } = await supabase
    .from('documents')
    .select('size_bytes');

  const totalStorageBytes = (storageData ?? []).reduce(
    (sum: number, row: { size_bytes: number }) => sum + (row.size_bytes ?? 0),
    0
  );
  const remainingBytes = Math.max(0, PLATFORM_STORAGE_LIMIT_BYTES - totalStorageBytes);
  const usageRatio = totalStorageBytes / PLATFORM_STORAGE_LIMIT_BYTES;
  const isStorageCritical = usageRatio >= 0.8;

  if (error) {
    console.error("Supabase fetch error for tenants:", error);
  }

  return (
    <div className="w-full p-8">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Users className="text-primary mr-3" size={32} />
          {d.title}
        </h1>
        <div className="w-full md:w-auto flex items-center justify-center gap-3">
          {/* Глобальна статистика сховища файлів (Supabase Storage Buckets, ліміт 1 ГБ) */}
          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${isStorageCritical
            ? 'bg-red-950/30 border-red-500/50 text-red-400'
            : 'bg-background border-border/60 text-muted-foreground'
            }`}>
            <Database className={`w-3.5 h-3.5 shrink-0 ${isStorageCritical ? 'text-red-400' : 'text-primary/70'}`} />
            <div className="flex flex-col leading-tight">
              <span className={`font-semibold tabular-nums ${isStorageCritical ? 'text-red-400' : 'text-foreground'}`}>
                {d.storageStats.freeSpace}{formatBytes(remainingBytes)}{d.storageStats.outOf}1 GB
              </span>
              <span className="text-[10px] opacity-60">{d.storageStats.storageLabel}</span>
            </div>
          </div>
          <AddTenantModal />
        </div>
      </div>

      {/* Інъекція UI презентаційних компонентів */}
      {!tenants || tenants.length === 0 ? (
        <EmptyTenants />
      ) : (
        <TenantsGrid tenants={tenants as Tenant[]} />
      )}
    </div>
  );
}
