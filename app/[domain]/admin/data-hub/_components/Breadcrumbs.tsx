import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Home, ChevronRight } from 'lucide-react';
import { dict } from '@/lib/i18n/dictionaries';

interface BreadcrumbsProps {
  currentFolderId: string | null;
}

interface FolderNode {
  id: string;
  name: string;
  parent_id: string | null;
}

// Walks up the parent_id chain to build the full path (root → ... → current)
async function buildPath(
  folderId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<FolderNode[]> {
  const crumbs: FolderNode[] = [];
  let current: string | null = folderId;

  while (current) {
    const { data }: { data: FolderNode | null } = await supabase
      .from('documents')
      .select('id, name, parent_id')
      .eq('id', current)
      .single();

    if (!data) break;
    crumbs.unshift(data);
    current = data.parent_id;
  }
  return crumbs;
}

export const Breadcrumbs = async ({ currentFolderId }: BreadcrumbsProps) => {
  const d = dict.uk.dataHub.breadcrumbs;

  if (!currentFolderId) {
    return (
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
        <Home className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium text-foreground">{d.home}</span>
      </nav>
    );
  }

  const supabase = await createClient();
  const crumbs = await buildPath(currentFolderId, supabase);

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3 flex-wrap">
      {/* Home link always navigates to root */}
      <Link
        href="?"
        className="flex items-center gap-1 hover:text-primary transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{d.home}</span>
      </Link>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.name}</span>
            ) : (
              <Link
                href={`?folder=${crumb.id}`}
                className="hover:text-primary transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
