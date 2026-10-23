import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/config";

export type Db = SupabaseClient;

export interface CookieAdapter {
  getAll(): { name: string; value: string }[];
  setAll(cookies: { name: string; value: string; options?: Record<string, unknown> }[]): void;
}

/**
 * Client scoped to the signed-in user's JWT. The default for every service
 * function; RLS is the authorization model. The caller supplies cookie access
 * so the data layer stays free of HTTP.
 */
export function createUserClient(cookies: CookieAdapter): Db {
  const env = publicEnv();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (list) => cookies.setAll(list),
    },
  });
}

/**
 * Bypasses RLS. Reach it only through `getServiceSupabase()` in
 * `lib/services/_context.ts`, whose reasons are a closed list.
 */
export function createAdminClient(): Db {
  const env = publicEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
