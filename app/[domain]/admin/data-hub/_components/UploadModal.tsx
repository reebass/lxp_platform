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

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  dynamicStyles: Record<string, string>;
  initialFile?: File | null;
}

export const UploadModal = ({ open, onOpenChange, tenantId, dynamicStyles, initialFile }: UploadModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={dynamicStyles as React.CSSProperties} className="max-w-lg bg-background-content text-foreground">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              Додати документ до бази знань
            </span>
          </DialogTitle>
          <DialogDescription>
            Підтримуються PDF, DOCX та TXT файли до 10MB.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <UploadZone
            tenantId={tenantId}
            initialFile={initialFile}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
