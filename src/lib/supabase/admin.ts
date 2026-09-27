import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Service-role client. Bypasses RLS, only use in trusted server code. */
export function createAdminClient() {
  const key = env.supabaseServiceRoleKey();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(env.supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
