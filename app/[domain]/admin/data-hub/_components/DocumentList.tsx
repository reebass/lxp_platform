'use client';

import React, { useEffect, useState } from 'react';
import { FileRow, type DocItem } from './FileRow';
import { createClient } from '@/lib/supabase/client';
import { Database } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

interface DocumentListProps {
  initialDocs: DocItem[];
  dynamicStyles: Record<string, string>;
  tenantId: string;
  currentFolderId: string | null;
}

export const DocumentList = ({
  initialDocs,
  dynamicStyles,
  tenantId,
  currentFolderId,
}: DocumentListProps) => {
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const supabase = createClient();

  // Sync state if initialDocs changes (e.g. navigation between folders)
  useEffect(() => {
    setDocs(initialDocs);
  }, [initialDocs]);

  useEffect(() => {
    // 1. Set up the channel
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const updatedDoc = payload.new as DocItem;

          setDocs((currentDocs) =>
            currentDocs.map((doc) =>
              doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc
            )
          );
        }
      )
      .subscribe();

    // 2. Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, tenantId]);

  if (docs.length === 0) {
    const d = dict.uk.dataHub.list;
    return (
      <tr>
        <td colSpan={4} className="px-6 py-16 text-center ">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Database className="w-10 h-10 opacity-20" />
            <p className="text-sm">
              {currentFolderId ? d.folderEmpty : d.dbEmpty}
            </p>
            <p className="text-xs opacity-60">
              {currentFolderId ? d.folderHint : d.dbHint}
            </p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {docs.map((doc) => (
        <FileRow key={doc.id} doc={doc} dynamicStyles={dynamicStyles} />
      ))}
    </>
  );
};
