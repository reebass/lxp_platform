'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DataHubHeader } from './DataHubHeader';
import { UploadModal } from './UploadModal';

interface DataHubClientProps {
  tenantId: string;
  dynamicStyles: Record<string, string>;
  currentFolderId: string | null;
  children: React.ReactNode;
}

export const DataHubClient = ({
  tenantId,
  dynamicStyles,
  currentFolderId,
  children,
}: DataHubClientProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalDragFile, setGlobalDragFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleGlobalDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.types.includes('Files')) setIsDraggingOver(true);
  }, []);

  const handleGlobalDragLeave = useCallback((e: DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) setIsDraggingOver(false);
  }, []);

  const handleGlobalDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) { setGlobalDragFile(file); setIsModalOpen(true); }
  }, []);

  useEffect(() => {
    const handleCustomOpen = () => { setGlobalDragFile(null); setIsModalOpen(true); };
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragleave', handleGlobalDragLeave);
    window.addEventListener('drop', handleGlobalDrop);
    window.addEventListener('open-upload-modal', handleCustomOpen);
    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragleave', handleGlobalDragLeave);
      window.removeEventListener('drop', handleGlobalDrop);
      window.removeEventListener('open-upload-modal', handleCustomOpen);
    };
  }, [handleGlobalDragOver, handleGlobalDragLeave, handleGlobalDrop]);

  return (
    <>
      {isDraggingOver && (
        <div className="fixed inset-0 z-40 pointer-events-none border-4 border-dashed border-primary/60 bg-primary/5 backdrop-blur-sm rounded-lg m-2" />
      )}

      <DataHubHeader />

      <UploadModal
        open={isModalOpen}
        onOpenChange={(open) => { setIsModalOpen(open); if (!open) setGlobalDragFile(null); }}
        tenantId={tenantId}
        dynamicStyles={dynamicStyles}
        initialFile={globalDragFile}
        currentFolderId={currentFolderId}
      />

      {children}
    </>
  );
};
