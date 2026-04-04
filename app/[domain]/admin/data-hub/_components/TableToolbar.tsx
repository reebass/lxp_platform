'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Search, FolderPlus, CornerUpLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateFolderModal } from './CreateFolderModal';
import { dict } from '@/lib/i18n/dictionaries';

interface TableToolbarProps {
  currentFolderId: string | null;
  tenantId: string;
  /** undefined = at root (no back button); null = parent is root; string = parent folder id */
  parentFolderId?: string | null;
  dynamicStyles: Record<string, string>;
}

export const TableToolbar = ({
  currentFolderId,
  tenantId,
  parentFolderId,
  dynamicStyles,
}: TableToolbarProps) => {
  const router = useRouter();
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const handleOpenUpload = () => {
    window.dispatchEvent(new Event('open-upload-modal'));
  };

  const handleBack = () => {
    router.push(parentFolderId ? `?folder=${parentFolderId}` : '?');
  };

  const d = dict.uk.dataHub.toolbar;

  return (
    <>
      <div className=" flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Back button — animated in when inside a folder */}
          {parentFolderId !== undefined && (
            <button
              onClick={handleBack}
              title={d.back}
              className="cursor-pointer animate-in fade-in slide-in-from-left-2 duration-200
                shrink-0 p-2 rounded-lg border border-border/60 bg-background-content/50
                hover:bg-primary/10 hover:border-primary/40 hover:text-primary
                text-muted-foreground transition-all"
            >
              <CornerUpLeft className="w-4 h-4" />
            </button>
          )}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={d.searchPlaceholder}
              className="flex h-10 w-full rounded-md border border-border/60 bg-background-content/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto text-sm">
          <Button variant="outline" className="w-full sm:w-auto gap-2 border-border/60">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{d.export}</span>
          </Button>
          {/* Create folder button */}
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-border/60"
            onClick={() => setIsFolderModalOpen(true)}
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{d.newFolder}</span>
          </Button>
          <Button
            onClick={handleOpenUpload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            {d.addDoc}
          </Button>
        </div>
      </div>

      {/* Create folder modal */}
      <CreateFolderModal
        open={isFolderModalOpen}
        onOpenChange={setIsFolderModalOpen}
        currentFolderId={currentFolderId}
        tenantId={tenantId}
        dynamicStyles={dynamicStyles}
      />
    </>
  );
};
