'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { UploadZone } from './UploadZone';
import { UploadCloud } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  dynamicStyles: Record<string, string>;
  initialFiles?: File[] | null;
  currentFolderId?: string | null;
}

export const UploadModal = ({
  open,
  onOpenChange,
  tenantId,
  dynamicStyles,
  initialFiles,
  currentFolderId = null,
}: UploadModalProps) => {
  const d = dict.uk.dataHub.uploadModal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={dynamicStyles as React.CSSProperties} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              {d.title}
            </span>
          </DialogTitle>
          <DialogDescription>
            {d.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <UploadZone
            tenantId={tenantId}
            initialFiles={initialFiles}
            currentFolderId={currentFolderId}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
