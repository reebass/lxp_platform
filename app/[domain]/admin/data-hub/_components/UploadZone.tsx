'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UploadZoneProps {
  tenantId: string;
  /** Called after a successful upload so a parent (e.g. modal) can close */
  onClose?: () => void;
  /** Pre-seed a file that was dropped globally before the modal opened */
  initialFile?: File | null;
  /** Target folder for the upload — null means root */
  currentFolderId?: string | null;
}

export const UploadZone = ({ tenantId, onClose, initialFile, currentFolderId = null }: UploadZoneProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Pre-seed from a globally-dropped file
  useEffect(() => {
    if (initialFile) {
      setPendingFile(initialFile);
      setCustomName(initialFile.name);
    }
  }, [initialFile]);

  const handleClickZone = () => {
    if (isUploading || pendingFile) return;
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
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
  };

  const pickFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) { toast.error('Файл перевищує ліміт 10MB.'); return; }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      toast.error('Дозволені лише файли PDF, DOCX та TXT.');
      return;
    }

    setPendingFile(file);
    setCustomName(file.name);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFile = () => {
    setPendingFile(null);
    setCustomName('');
  };

  const handleUpload = async () => {
    if (!pendingFile) return;

    setIsUploading(true);
    const toastId = toast.loading(`Завантаження ${customName || pendingFile.name}…`);

    try {
      const supabase = createClient();
      const safeName = pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}_${safeName}`;
      const filePath = `${tenantId}/${fileName}`;

      // 1. Upload to Storage
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('tenant_documents')
        .upload(filePath, pendingFile);

      if (uploadError) throw new Error(`Storage: ${uploadError.message}`);

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          tenant_id: tenantId,
          name: customName.trim() || pendingFile.name,
          size_bytes: pendingFile.size,
          file_path: storageData.path,
          status: 'ready',
          parent_id: currentFolderId ?? null,
        });

      if (dbError) {
        console.error('DB Insert Error:', dbError);
        toast.error(`Помилка бази даних: ${dbError.message}`, { id: toastId });
        return;
      }

      toast.success('Документ успішно завантажено!', { id: toastId });
      router.refresh();
      onClose?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Невідома помилка.';
      console.error('Upload failed:', error);
      toast.error(message, { id: toastId });
    } finally {
      setIsUploading(false);
      setPendingFile(null);
      setCustomName('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        disabled={isUploading}
      />

      {/* ── Drop Zone ── */}
      {!pendingFile && (
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
          <h3 className="text-base font-semibold text-foreground mb-1">Перетягніть файл або натисніть</h3>
          <p className="text-xs text-muted-foreground">PDF, DOCX, TXT · до 10MB</p>
        </div>
      )}

      {/* ── File selected: show name editor ── */}
      {pendingFile && (
        <div className="rounded-xl border border-border/60 bg-background-content/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{pendingFile.name}</p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                {(pendingFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="text-muted-foreground hover:text-foreground text-xs underline shrink-0"
              disabled={isUploading}
            >
              Змінити
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Назва документа
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={isUploading}
              placeholder="Назва документа..."
              className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground
                placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40
                disabled:opacity-50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ── Upload button ── */}
      {pendingFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading || !customName.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-background
            px-4 py-3 text-sm font-semibold shadow-lg shadow-primary/20
            hover:shadow-primary/40 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Завантаження…</>
          ) : (
            <><UploadCloud className="w-4 h-4" /> Завантажити документ</>
          )}
        </button>
      )}
    </div>
  );
};
