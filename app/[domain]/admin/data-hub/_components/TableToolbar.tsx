'use client';

import React, { useState } from 'react';
import { Plus, Download, Search, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateFolderModal } from './CreateFolderModal';

interface TableToolbarProps {
  currentFolderId: string | null;
  tenantId: string;
}

export const TableToolbar = ({ currentFolderId, tenantId }: TableToolbarProps) => {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const handleOpenUpload = () => {
    window.dispatchEvent(new Event('open-upload-modal'));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Пошук документів..."
            className="flex h-10 w-full rounded-md border border-border/60 bg-background-content/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 pl-9"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto text-sm">
          <Button variant="outline" className="w-full sm:w-auto gap-2 border-border/60">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Експорт</span>
          </Button>
          {/* Create folder button */}
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-border/60"
            onClick={() => setIsFolderModalOpen(true)}
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Нова папка</span>
          </Button>
          <Button
            onClick={handleOpenUpload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Додати документ
          </Button>
        </div>
      </div>

      {/* Create folder modal */}
      <CreateFolderModal
        open={isFolderModalOpen}
        onOpenChange={setIsFolderModalOpen}
        currentFolderId={currentFolderId}
        tenantId={tenantId}
      />
    </>
  );
};
