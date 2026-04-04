import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from 'lucide-react';
import { TableToolbar } from './TableToolbar';
import { FileRow, type DocItem } from './FileRow';
import { DocumentList } from './DocumentList';
import { Breadcrumbs } from './Breadcrumbs';
import { dict } from '@/lib/i18n/dictionaries';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const DocumentTable = async ({
  tenantId,
  storageLimitMb,
  currentFolderId = null,
  dynamicStyles,
}: {
  tenantId: string;
  storageLimitMb: number;
  currentFolderId?: string | null;
  dynamicStyles: Record<string, string>;
}) => {
  const supabase = await createClient();
  const storageLimitBytes = storageLimitMb * 1024 * 1024;

  // Fetch items in the current folder, folders sorted first then by date
  const baseQuery = supabase
    .from('documents')
    .select('id, name, size_bytes, file_path, status, created_at, is_folder, parent_id')
    .eq('tenant_id', tenantId);

  const { data: documents, error } = currentFolderId
    ? await baseQuery
      .eq('parent_id', currentFolderId)
      .order('is_folder', { ascending: false })
      .order('created_at', { ascending: false })
    : await baseQuery
      .is('parent_id', null)
      .order('is_folder', { ascending: false })
      .order('created_at', { ascending: false });

  // Resolve the parent folder id so the toolbar can render a Back button
  let parentFolderId: string | null | undefined = undefined;
  if (currentFolderId) {
    const { data: currentFolder } = await supabase
      .from('documents')
      .select('parent_id')
      .eq('id', currentFolderId)
      .single();
    parentFolderId = currentFolder?.parent_id ?? null;
  }

  const docs: DocItem[] = documents ?? [];
  const folders = docs.filter((d) => d.is_folder);
  const files = docs.filter((d) => !d.is_folder);
  const totalBytes = files.reduce((sum, d) => sum + (d.size_bytes ?? 0), 0);
  const usagePercent = Math.min((totalBytes / storageLimitBytes) * 100, 100);

  const d = dict.uk.dataHub.table;

  return (
    <div className="space-y-4">
      {/* ── Breadcrumbs (Server Component — fetches ancestor chain) ── */}
      <Breadcrumbs currentFolderId={currentFolderId} />

      {/* ── Section header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          {d.title}
          {folders.length > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] py-0.5 px-2 rounded-full border border-primary/20">
              {d.foldersCount.replace('{count}', String(folders.length))}
            </span>
          )}
          <span className="bg-primary/10 text-primary text-[10px] py-0.5 px-2 rounded-full border border-primary/20">
            {d.filesCount.replace('{count}', String(files.length))}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-tighter">
            {d.aiStatus}
          </span>
        </div>
      </div>

      {/* TableToolbar is a Client Component — needs tenantId and currentFolderId */}
      <TableToolbar
        tenantId={tenantId}
        currentFolderId={currentFolderId}
        parentFolderId={parentFolderId}
        dynamicStyles={dynamicStyles}
      />

      {/* ── Table ── */}
      <div className="rounded-xl border border-border/60 bg-background-content/30 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/40 border-b border-border/40">
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
                  {d.colName}
                </th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground hidden sm:table-cell">
                  {d.colDate}
                </th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground text-center">
                  {d.colStatus}
                </th>
                <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-bold text-muted-foreground text-right">
                  {d.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {error && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-red-400">
                    {d.error} {error.message}
                  </td>
                </tr>
              )}

              {/* FileRow is a Client Component — handles inline edit, dropdown, delete confirm */}
              <DocumentList
                initialDocs={docs}
                dynamicStyles={dynamicStyles}
                tenantId={tenantId}
                currentFolderId={currentFolderId}
              />
            </tbody>
          </table>
        </div>

        {/* ── Footer: Storage Stats ── */}
        <div className="bg-background/20 px-6 py-4 border-t border-border/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-[10px] text-muted-foreground italic">
            {d.encryptionNote}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Database className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <div className="flex flex-col gap-1 min-w-[160px]">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{d.storage}</span>
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
