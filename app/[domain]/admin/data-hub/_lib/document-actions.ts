"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Types ─────────────────────────────────────────────────────────────────────
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// ── Helper: Recursive Storage path collector ──────────────────────────────────
// Traverses the documents tree rooted at folderId and returns a flat array of
// all file_path values for non-folder descendants (files only).
// Used before deleting a folder to clean up Storage orphans.
async function getDescendantFilePaths(
  folderId: string,
  supabase: SupabaseServerClient,
): Promise<string[]> {
  const { data: children } = await supabase
    .from('documents')
    .select('id, is_folder, file_path')
    .eq('parent_id', folderId);

  if (!children || children.length === 0) return [];

  const paths: string[] = [];

  for (const child of children) {
    if (child.is_folder) {
      // Recurse into sub-folders to collect their files
      const nestedPaths = await getDescendantFilePaths(child.id, supabase);
      paths.push(...nestedPaths);
    } else if (child.file_path) {
      paths.push(child.file_path);
    }
  }

  return paths;
}

// ── createFolder ──────────────────────────────────────────────────────────────
// Inserts a folder record (is_folder: true) under the given parentId.
// parentId = null → root-level folder.
export async function createFolder(
  name: string,
  parentId: string | null,
  tenantId: string,
) {
  if (!name || name.trim() === '') {
    return { error: 'Назва папки не може бути порожньою.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('documents').insert({
    tenant_id: tenantId,
    name: name.trim(),
    is_folder: true,
    parent_id: parentId ?? null,
    // Folders have no physical storage object — use empty string to satisfy
    // any NOT NULL constraint that may exist on the column.
    file_path: '',
    size_bytes: 0,
    status: 'ready',
  });

  if (error) {
    console.error('createFolder error:', error);
    return { error: error.message };
  }

  revalidatePath('/[domain]/admin/data-hub', 'page');
  return { success: true };
}

// ── renameDocument ────────────────────────────────────────────────────────────
// Updates the name of any document or folder by its ID.
export async function renameDocument(id: string, newName: string) {
  if (!newName || newName.trim() === '') {
    return { error: 'Назва не може бути порожньою.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('documents')
    .update({ name: newName.trim() })
    .eq('id', id);

  if (error) {
    console.error('renameDocument error:', error);
    return { error: error.message };
  }

  revalidatePath('/[domain]/admin/data-hub', 'page');
  return { success: true };
}

// ── deleteDocument ────────────────────────────────────────────────────────────
// Deletes a file or folder.
//
// FILE:   removes the Storage object, then deletes the DB row.
// FOLDER: recursively collects all descendant file_paths, removes them from
//         Storage in a single batch call, then deletes the folder DB row.
//         PostgreSQL ON DELETE CASCADE handles removing descendant DB rows.
export async function deleteDocument(id: string, isFolder: boolean) {
  const supabase = await createClient();

  if (isFolder) {
    // ── FOLDER: recursive Storage cleanup first ──────────────────────────────
    const filePaths = await getDescendantFilePaths(id, supabase);

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('tenant_documents')
        .remove(filePaths);

      if (storageError) {
        // Log but don't abort — a partial Storage failure shouldn't leave
        // orphaned DB rows; we still want the DB cleanup to proceed.
        console.error(
          'Storage batch remove error (folder descendants):',
          storageError,
        );
      }
    }

    // Delete the folder row — ON DELETE CASCADE removes all child rows in DB
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('deleteDocument (folder) DB error:', dbError);
      return { error: dbError.message };
    }
  } else {
    // ── FILE: fetch path → remove from Storage → delete DB row ──────────────
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError || !doc) {
      return { error: 'Документ не знайдено.' };
    }

    if (doc.file_path) {
      const { error: storageError } = await supabase.storage
        .from('tenant_documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError, '| path:', doc.file_path);
        // Not fatal — prioritise DB consistency
      }
    }

    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('deleteDocument (file) DB error:', dbError);
      return { error: dbError.message };
    }
  }

  revalidatePath('/[domain]/admin/data-hub', 'page');
  return { success: true };
}

// ── moveDocument ──────────────────────────────────────────────────────────────
// Updates the parent_id for the document with the given id.
export async function moveDocument(id: string, newParentId: string | null) {
  if (id === newParentId) {
    return { error: 'Неможливо перемістити папку в саму себе.' };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('documents')
    .update({ parent_id: newParentId })
    .eq('id', id);

  if (error) {
    console.error('moveDocument error:', error);
    return { error: error.message };
  }

  revalidatePath('/[domain]/admin/data-hub', 'page');
  return { success: true };
}
