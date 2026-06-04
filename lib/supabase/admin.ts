import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requireEnv, supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

export function createAdminSupabaseClient() {
  return createClient(
    requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}
