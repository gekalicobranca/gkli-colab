"use client";

import { createClient } from "@supabase/supabase-js";
import { requireEnv, supabasePublishableKey, supabaseUrl } from "@/lib/env";

export function createBrowserSupabaseClient() {
  return createClient(
    requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(supabasePublishableKey, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  );
}
