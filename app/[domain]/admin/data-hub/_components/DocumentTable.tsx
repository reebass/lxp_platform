import React from 'react';
import { createClient } from '@/lib/supabase/server';
import {
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  Database,
} from 'lucide-react';
import { TableToolbar } from './TableToolbar';

// ── Types ────────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  name: string;
  size_bytes: number;
  file_path: string;
  status: string;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export const DocumentTable = async ({ tenantId, storageLimitMb }: { tenantId: string; storageLimitMb: number }) => {
  const supabase = await createClient();
  // Конвертуємо ліміт зі сховища (в МБ) у байти для розрахунку відсотків.
  const storageLimitBytes = storageLimitMb * 1024 * 1024;

  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, name, size_bytes, file_path, status, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  const docs: Document[] = documents ?? [];
  const totalBytes = docs.reduce((sum, d) => sum + (d.size_bytes ?? 0), 0);
  const usagePercent = Math.min((totalBytes / storageLimitBytes) * 100, 100);

  return (
    <div className="space-y-4">
      {/* ── Section header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          Реєстр документів
          <span className="bg-primary/10 text-primary text-[10px] py-0.5 px-2 rounded-full border border-primary/20">
            {docs.length} ФАЙЛІВ
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-tighter">
            AI Опрацювання в нормі
          </span>
        </div>
      </div>

      <TableToolbar />

      {/* ── Table ── */}
      <div className="rounded-xl border border-border/60 bg-background-content/30 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/40 border-b border-border/40">
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
                  Назва файлу
                </th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground hidden sm:table-cell">
                  Дата завантаження
                </th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground text-center">
                  Статус
                </th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground text-right">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {error && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-red-400">
                    Помилка завантаження даних: {error.message}
                  </td>
                </tr>
              )}
              {!error && docs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Database className="w-10 h-10 opacity-20" />
                      <p className="text-sm">База знань порожня.</p>
                      <p className="text-xs opacity-60">Натисніть «Додати документ», щоб розпочати.</p>
                    </div>
                  </td>
                </tr>
              )}
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-primary/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-1 bg-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                        <div className="relative p-2 rounded-lg bg-background-content border border-border/60">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-xs">
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                          {formatBytes(doc.size_bytes)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-mono hidden sm:table-cell">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {doc.status === 'ready' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                          <CheckCircle2 className="w-3 h-3" />
                          Готово
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Аналіз...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-muted-foreground hover:text-red-400 transition-all hover:bg-red-400/10 rounded-lg"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer: Storage Stats ── */}
        <div className="bg-background/20 px-6 py-4 border-t border-border/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-[10px] text-muted-foreground italic">
            * Всі завантажені документи шифруються за стандартом AES-256
          </p>
          {/* Compact storage bar */}
          <div className="flex items-center gap-3 shrink-0">
            <Database className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <div className="flex flex-col gap-1 min-w-[160px]">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Сховище</span>
                <span className="font-semibold tabular-nums">
                  {formatBytes(totalBytes)} / {formatBytes(storageLimitBytes)}
                </span>
              </div>
              <div className="w-full bg-border/30 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full shadow-[0_0_6px_rgba(0,240,255,0.4)] transition-all duration-700"
                  style={{ width: `${Math.max(usagePercent, 0.3)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
