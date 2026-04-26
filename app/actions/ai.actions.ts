"use server";

import { generateText, type AiAction } from '@/lib/ai/ai-client';
import { checkCoursePermissions } from '@/app/actions/course';

interface GenerateResult {
  result?: string;
  error?: string;
}

/**
 * Server Action: generate text content for a course node.
 * - Verifies user has admin/superadmin role
 * - Proxies the request to FastAPI ai-service
 * - Never exposes the AI service URL to the client
 */
export async function generateNodeContentAction(
  prompt: string,
  action: AiAction,
  context?: string,
): Promise<GenerateResult> {
  try {
    // Auth check — only admin/superadmin can use AI features
    const permissions = await checkCoursePermissions();
    if ('error' in permissions) {
      return { error: permissions.error };
    }

    const { result } = await generateText(prompt, action, context);
    return { result };
  } catch (err: unknown) {
    console.error('[generateNodeContentAction] Error:', err);
    const message = err instanceof Error ? err.message : 'Помилка генерації';
    return { error: message };
  }
}
