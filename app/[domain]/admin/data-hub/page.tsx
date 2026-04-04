import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hexToHsl } from '@/lib/colors';
import { DataHubClient } from './_components/DataHubClient';
import { DocumentTable } from './_components/DocumentTable';

export default async function DataHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ folder?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const rawDomain = decodeURIComponent(resolvedParams.domain);
  const cleanDomain = rawDomain.replace('.localhost', '');

  // currentFolderId drives both the DocumentTable query and the upload target
  const currentFolderId = resolvedSearch.folder ?? null;

  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, color_content, color_background, color_foreground, color_muted_foreground, color_primary, color_border, storage_limit_mb')
    .or(`subdomain.eq."${cleanDomain}",corporate_domain.eq."${cleanDomain}"`)
    .maybeSingle();

  if (error || !tenant) {
    notFound();
  }

  const dynamicStyles: Record<string, string> = {};
  const assignColor = (cssVar: string, dbHexValue: string | null) => {
    if (dbHexValue) dynamicStyles[cssVar] = hexToHsl(dbHexValue);
  };

  assignColor('--background', tenant.color_content);
  assignColor('--background-content', tenant.color_background);
  assignColor('--foreground', tenant.color_foreground);
  assignColor('--muted-foreground', tenant.color_muted_foreground);
  assignColor('--primary', tenant.color_primary);
  assignColor('--border', tenant.color_border);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DataHubClient
        tenantId={tenant.id}
        dynamicStyles={dynamicStyles}
        currentFolderId={currentFolderId}
      >
        <DocumentTable
          tenantId={tenant.id}
          storageLimitMb={tenant.storage_limit_mb ?? 1024}
          currentFolderId={currentFolderId}
          dynamicStyles={dynamicStyles}
        />
      </DataHubClient>
    </div>
  );
}
