"use server";

import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';

// ---------- types ----------
interface SaveCourseResult {
  success?: boolean;
  courseId?: string;
  error?: string;
}

interface GetCourseResult {
  data?: {
    id: string;
    title: string;
    flow_data: { nodes: unknown[]; edges: unknown[] } | null;
  };
  error?: string;
  errorCode?: 'not_found' | 'access_denied';
}

interface CoursePermissions {
  userId: string;
  role: 'admin' | 'superadmin';
  /** null for superadmin (master base), uuid for admin (tenant isolation) */
  tenantId: string | null;
}

type PermissionsResult =
  | CoursePermissions
  | { error: string };

// ---------- permissions utility ----------

/**
 * Reusable permission check for all course-related Server Actions.
 * Uses the SSR client (user session) for authentication & profile lookup.
 * - superadmin → tenantId = null (master base)
 * - admin → tenantId = profile.tenant_id (tenant isolation)
 * - other roles → access denied
 */
export async function checkCoursePermissions(): Promise<PermissionsResult> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Не авторизовано' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'Профіль не знайдено' };
  }

  const role = profile.role as string;

  if (role !== 'admin' && role !== 'superadmin') {
    return { error: 'Недостатньо прав для управління курсами' };
  }

  return {
    userId: user.id,
    role: role as 'admin' | 'superadmin',
    tenantId: role === 'superadmin' ? null : (profile.tenant_id as string),
  };
}

// ---------- helper ----------
function isError(result: PermissionsResult): result is { error: string } {
  return 'error' in result;
}

// ---------- actions ----------

/**
 * Save (upsert) the React Flow canvas data into the courses table.
 * Auth check: SSR client (user session).
 * Mutation: adminClient (service role, bypasses RLS).
 */
export async function saveCourse(
  courseId: string | null,
  flowData: { nodes: unknown[]; edges: unknown[] },
  title?: string,
): Promise<SaveCourseResult> {
  try {
    // ── Auth layer (SSR client) ──
    const permissions = await checkCoursePermissions();
    if (isError(permissions)) return { error: permissions.error };

    const { userId, role, tenantId } = permissions;

    // ── Mutation layer (service role — bypasses RLS) ──
    if (!courseId) {
      const payload = {
        tenant_id: tenantId,
        author_id: userId,
        title: title || (role === 'superadmin' ? 'Новий майстер-курс' : 'Новий курс'),
        flow_data: flowData,
        status: 'draft',
      };

      const { data, error } = await adminClient
        .from('courses')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        console.error('[saveCourse] INSERT error:', error);
        return { error: error.message };
      }

      return { success: true, courseId: data.id };
    }

    // UPDATE existing course — scope by tenantId for isolation
    let query = adminClient
      .from('courses')
      .update({
        flow_data: flowData,
        ...(title ? { title } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId);

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    } else {
      query = query.is('tenant_id', null);
    }

    const { error } = await query;

    if (error) {
      console.error('[saveCourse] UPDATE error:', error);
      return { error: error.message };
    }

    return { success: true, courseId };
  } catch (err: unknown) {
    console.error('[saveCourse] Unexpected error:', err);
    return { error: 'Помилка при збереженні курсу' };
  }
}

/**
 * Load a course by ID.
 * Auth check: SSR client. Read: adminClient (bypasses RLS).
 * Returns errorCode: 'not_found' | 'access_denied' for UI routing.
 */
export async function getCourse(courseId: string): Promise<GetCourseResult> {
  try {
    // Validate UUID format — garbage IDs should not hit the DB
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(courseId)) {
      return { error: 'Курс не знайдено', errorCode: 'not_found' };
    }

    const permissions = await checkCoursePermissions();
    if (isError(permissions)) return { error: permissions.error };

    const { tenantId } = permissions;

    // Step 1: Check if course exists at all (no tenant filter)
    const { data: exists } = await adminClient
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .maybeSingle();

    if (!exists) {
      return { error: 'Курс не знайдено', errorCode: 'not_found' };
    }

    // Step 2: Check if user has access (with tenant filter)
    let query = adminClient
      .from('courses')
      .select('id, title, flow_data')
      .eq('id', courseId);

    if (tenantId) {
      query = query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`);
    } else {
      query = query.is('tenant_id', null);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('[getCourse] error:', error);
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Курс не знайдено, або у вас недостатньо прав', errorCode: 'access_denied' };
    }

    return {
      data: {
        id: data.id,
        title: data.title,
        flow_data: data.flow_data as { nodes: unknown[]; edges: unknown[] } | null,
      },
    };
  } catch (err: unknown) {
    console.error('[getCourse] Unexpected error:', err);
    return { error: 'Помилка при завантаженні курсу' };
  }
}
