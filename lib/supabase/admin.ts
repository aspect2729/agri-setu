import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Server-side only: used for creating
 * accounts on behalf of store staff and for the public batch trace page.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
