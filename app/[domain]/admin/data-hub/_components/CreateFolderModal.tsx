'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { createFolder } from '../_lib/document-actions';
import { toast } from 'sonner';

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolderId: string | null;
  tenantId: string;
}

export const CreateFolderModal = ({
  open,
  onOpenChange,
  currentFolderId,
  tenantId,
}: CreateFolderModalProps) => {
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleOpenChange = (next: boolean) => {
    if (!next) setName('');
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    try {
      const result = await createFolder(name.trim(), currentFolderId, tenantId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Папку «${name.trim()}» створено`);
        router.refresh();
        handleOpenChange(false);
      }
    } catch {
      toast.error('Не вдалось створити папку');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary" />
              Нова папка
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Назва папки
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Наприклад: Договори"
                disabled={isPending}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground
                  placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40
                  disabled:opacity-50 transition-colors"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Скасувати
                </Button>
              </DialogClose>
              <Button type="submit" variant="primary" disabled={isPending || !name.trim()}>
                {isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Створення...</>
                  : 'Створити'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
