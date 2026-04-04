'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Folder,
  Trash2,
  Pencil,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { renameDocument, deleteDocument, moveDocument } from '../_lib/document-actions';
import { toast } from 'sonner';
import { dict } from '@/lib/i18n/dictionaries';

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

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DocItem {
  id: string;
  name: string;
  is_folder: boolean;
  file_path: string;
  size_bytes: number;
  status: string;
  created_at: string;
  parent_id: string | null;
}

// ── FileRow ───────────────────────────────────────────────────────────────────
// Client component: handles all per-row interactivity (navigation, rename, delete).
// Returns a fragment: <tr> + a portalled <Dialog>. The Dialog renders into
// document.body via RadixUI Portal — no invalid HTML nesting occurs.
export const FileRow = ({
  doc,
  dynamicStyles,
}: {
  doc: DocItem;
  dynamicStyles: Record<string, string>;
}) => {
  const router = useRouter();

  // ── Inline edit state ────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(doc.name);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Delete confirm state ─────────────────────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Drag & drop state ────────────────────────────────────────────────────
  const [isDragOver, setIsDragOver] = useState(false);

  const d = dict.uk.dataHub.row;

  // ── Edit handlers ─────────────────────────────────────────────────────────
  const startEdit = () => {
    setEditValue(doc.name);
    setIsEditing(true);
    // Defer focus so the input is mounted first
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(doc.name);
  };

  const saveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === doc.name) { cancelEdit(); return; }

    setIsSaving(true);
    try {
      const result = await renameDocument(doc.id, trimmed);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(d.renameSuccess);
        router.refresh();
      }
    } catch {
      toast.error(d.renameError);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
    else if (e.key === 'Escape') { cancelEdit(); }
  };

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDocument(doc.id, doc.is_folder);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(doc.is_folder ? d.deleteFolderSuccess : d.deleteFileSuccess);
        router.refresh();
      }
    } catch {
      toast.error(d.deleteError);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  // ── Folder click → navigate ───────────────────────────────────────────────
  const handleFolderClick = () => {
    if (doc.is_folder && !isEditing) router.push(`?folder=${doc.id}`);
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.dataTransfer.setData('text/plain', doc.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === doc.id) return;
    try {
      const result = await moveDocument(draggedId, doc.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(d.moveSuccess.replace('{name}', doc.name));
        router.refresh();
      }
    } catch {
      toast.error(d.moveError);
    }
  };

  return (
    <>
      <tr
        className={`hover:bg-primary/[0.03] transition-colors group cursor-pointer
          ${isDragOver ? 'bg-primary/10 ring-1 ring-inset ring-primary/30 cursor-pointer' : ''}`}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        {...(doc.is_folder ? {
          onDragOver: handleDragOver,
          onDragEnter: handleDragEnter,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
        } : {})}
      >

        {/* ── Name ── */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div
                className={`relative p-2 rounded-lg border border-border/60
                  ${doc.is_folder ? 'bg-primary/10 cursor-pointer' : 'bg-background-content'}`}
                onClick={handleFolderClick}
              >
                {doc.is_folder
                  ? <Folder className="w-5 h-5 text-primary" />
                  : <FileText className="w-5 h-5 text-primary" />}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="w-full max-w-xs rounded border border-primary/60 bg-content px-2 py-0.5
                    text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40
                    disabled:opacity-50 transition-colors"
                />
              ) : (
                <div
                  className={`text-sm font-medium text-foreground group-hover:text-primary
                    transition-colors truncate max-w-[200px] sm:max-w-xs select-none
                    ${doc.is_folder ? 'cursor-pointer hover:underline underline-offset-4' : 'cursor-default'}`}
                  onClick={handleFolderClick}
                  onDoubleClick={startEdit}
                  title={d.doubleClickRename}
                >
                  {doc.name}
                </div>
              )}
              <div className="text-[10px] text-muted-foreground uppercase tracking-tight">
                {doc.is_folder ? d.isFolder : formatBytes(doc.size_bytes)}
              </div>
            </div>
          </div>
        </td>

        {/* ── Date ── */}
        <td className="px-6 py-4 text-xs text-muted-foreground font-mono hidden sm:table-cell">
          {formatDate(doc.created_at)}
        </td>

        {/* ── Status ── */}
        <td className="px-6 py-4">
          <div className="flex justify-center">
            {doc.is_folder ? (
              <span className="text-[10px] text-muted-foreground/40">—</span>
            ) : doc.status === 'ready' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                <CheckCircle2 className="w-3 h-3" /> {d.statusReady}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 animate-pulse">
                <Clock className="w-3 h-3" /> {d.statusPending}
              </span>
            )}
          </div>
        </td>

        {/* ── Actions ── */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end opacity-60 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="cursor-pointer p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all focus:outline-none"
                  title={d.actionsLabel}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" style={dynamicStyles as React.CSSProperties}>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); startEdit(); }}>
                  <Pencil className="w-3.5 h-3.5" />
                  {d.actionRename}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-400 hover:bg-red-400/10 focus:text-red-400 focus:bg-red-400/10"
                  onSelect={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {d.actionDelete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>

      {/* ── Delete confirmation — rendered via RadixUI Portal (outside table DOM) ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent style={dynamicStyles as React.CSSProperties} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                {doc.is_folder ? d.deleteFolderTitle : d.deleteFileTitle}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              {doc.is_folder ? (
                <span dangerouslySetInnerHTML={{ __html: d.deleteFolderDesc.replace('{name}', `<span class="font-semibold text-foreground">«${doc.name}»</span>`) }} />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: d.deleteFileDesc.replace('{name}', `<span class="font-semibold text-foreground">«${doc.name}»</span>`) }} />
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isDeleting}>
                  {d.cancel}
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500/80 hover:bg-red-500 text-white border-transparent shadow-none"
              >
                {isDeleting
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{d.deleting}</>
                  : d.deleteBtn}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
