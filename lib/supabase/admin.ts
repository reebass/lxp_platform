import { createClient } from '@supabase/supabase-js';

/**
 * Service Role client — bypasses RLS completely.
 * 
 * ⚠️ ONLY for use inside Server Actions / Route Handlers.
 * NEVER expose this client or the service role key to the browser.
 * 
 * All authorization checks (role, tenant_id) MUST happen
 * in the calling Server Action BEFORE using this client.
 */
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
