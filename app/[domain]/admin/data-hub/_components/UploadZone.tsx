'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Loader2, FileText, Files } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { dict } from '@/lib/i18n/dictionaries';

interface UploadZoneProps {
  tenantId: string;
  /** Called after a successful upload so a parent (e.g. modal) can close */
  onClose?: () => void;
  /** Pre-seed files that were dropped globally before the modal opened */
  initialFiles?: File[] | null;
  /** Target folder for the upload — null means root */
  currentFolderId?: string | null;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const UploadZone = ({ tenantId, onClose, initialFiles, currentFolderId = null }: UploadZoneProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customName, setCustomName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const d = dict.uk.dataHub.uploadZone;

  const isSingle = selectedFiles.length === 1;
  const hasFiles = selectedFiles.length > 0;

  // Pre-seed from globally-dropped files
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      pickFiles(initialFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles]);

  // ── File picking & validation ────────────────────────────────────────────────
  const pickFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const file of incoming) {
      if (file.size > MAX_SIZE) {
        toast.error(d.sizeError.replace('{name}', file.name));
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
        toast.error(d.typeError.replace('{name}', file.name));
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;
    setSelectedFiles(valid);
    setCustomName(valid.length === 1 ? valid[0].name : '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setCustomName('');
  };

  // ── Drop zone handlers ────────────────────────────────────────────────────────
  const handleClickZone = () => {
    if (isUploading || hasFiles) return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (isUploading) return;
    pickFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pickFiles(Array.from(e.target.files ?? []));
  };

  // ── Upload ────────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const toastId = toast.loading(
      selectedFiles.length === 1
        ? d.uploadingSingle.replace('{name}', customName || selectedFiles[0].name)
        : d.uploadingMulti.replace('{count}', String(selectedFiles.length))
    );

    let successCount = 0;
    const supabase = createClient();

    for (const file of selectedFiles) {
      const dbName = isSingle ? (customName.trim() || file.name) : file.name;
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filePath = `${tenantId}/${Date.now()}_${safeName}`;

      // 1. Upload to Storage
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('tenant_documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError, '| file:', file.name);
        toast.error(`${d.storageError.replace('{name}', file.name)} ${uploadError.message}`);
        continue;
      }

      // 2. Insert DB record
      const { error: dbError } = await supabase.from('documents').insert({
        tenant_id: tenantId,
        name: dbName,
        size_bytes: file.size,
        file_path: storageData.path,
        status: 'pending',
        parent_id: currentFolderId ?? null,
      });

      if (dbError) {
        console.error('DB Insert Error:', dbError, '| file:', file.name);
        toast.error(`${d.dbError.replace('{name}', file.name)} ${dbError.message}`);
        continue;
      }

      successCount++;
    }

    setIsUploading(false);
    setSelectedFiles([]);
    setCustomName('');

    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? d.successSingle
          : d.successMulti.replace('{count}', String(successCount)),
        { id: toastId }
      );
      router.refresh();
      onClose?.();
    } else {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input — multiple enabled */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        multiple
        className="hidden"
        disabled={isUploading}
      />

      {/* ── Drop Zone (shown when no files selected) ── */}
      {!hasFiles && (
        <div
          onClick={handleClickZone}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative overflow-hidden group border-dashed border-2 rounded-xl transition-all duration-300
            flex flex-col items-center justify-center p-10 text-center cursor-pointer
            ${isHovering
              ? 'border-primary/80 bg-primary/10 scale-[1.01]'
              : 'border-primary/30 hover:border-primary/60 hover:bg-primary/5'
            }`}
        >
          <div className="relative mb-4">
            <div className={`absolute -inset-1 rounded-full blur transition duration-300 ${isHovering ? 'bg-primary/60' : 'bg-primary/20 group-hover:bg-primary/40'}`} />
            <div className="relative w-14 h-14 rounded-full bg-background border border-primary/20 flex items-center justify-center shadow-inner">
              <UploadCloud className={`w-7 h-7 text-primary transition-transform duration-300 ${isHovering ? 'scale-125' : 'group-hover:scale-110'}`} />
            </div>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">{d.dragTitle}</h3>
          <p className="text-xs text-muted-foreground">{d.dragSubtitle}</p>
        </div>
      )}

      {/* ── Single file selected ── */}
      {hasFiles && isSingle && (
        <div className="rounded-xl border border-border/60 bg-background-content/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{selectedFiles[0].name}</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                {formatBytes(selectedFiles[0].size)}
              </p>
            </div>
            <button
              onClick={clearFiles}
              className="text-muted-foreground hover:text-foreground text-xs underline shrink-0 cursor-pointer"
              disabled={isUploading}
            >
              {d.changeBtn}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {d.docNameLabel}
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={isUploading}
              placeholder={d.docNamePlaceholder}
              className="w-full rounded-lg border border-border/60 bg-content px-3 py-2 text-sm text-foreground
                placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40
                disabled:opacity-50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ── Multiple files selected ── */}
      {hasFiles && !isSingle && (
        <div className="rounded-xl border border-border/60 bg-background-content/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Files className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{d.selectedCount.replace('{count}', String(selectedFiles.length))}</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                {d.totalSize.replace('{size}', formatBytes(selectedFiles.reduce((s, f) => s + f.size, 0)))}
              </p>
            </div>
            <button
              onClick={clearFiles}
              className="text-muted-foreground hover:text-foreground text-xs underline shrink-0 cursor-pointer"
              disabled={isUploading}
            >
              {d.changeBtn}
            </button>
          </div>

          {/* Scrollable file list */}
          <ul className="max-h-[120px] overflow-y-auto space-y-1 pr-1">
            {selectedFiles.map((file, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3 shrink-0 text-primary/60" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-muted-foreground/50">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Upload button ── */}
      {hasFiles && (
        <button
          onClick={handleUpload}
          disabled={isUploading || (isSingle && !customName.trim())}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-background
            px-4 py-3 text-sm font-semibold shadow-lg shadow-primary/20
            hover:shadow-primary/40 transition-all duration-200 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {d.btnUploading}</>
          ) : (
            <><UploadCloud className="w-4 h-4" />
              {isSingle ? d.btnUploadSingle : d.btnUploadMulti.replace('{count}', String(selectedFiles.length))}
            </>
          )}
        </button>
      )}
    </div>
  );
};
