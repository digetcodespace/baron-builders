// Shared by the developer scripts. Gets an admin Supabase client for the linked project.
// The service key is read from SUPABASE_SERVICE_ROLE_KEY if set, otherwise from the signed-in
// Supabase CLI. It is held in memory only: never printed, never written to a file.
import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

export const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "syxcjsjquxvqqyxtxvme";
export const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

export function readServiceKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  const out = execSync(`npx --yes supabase@latest projects api-keys --project-ref ${PROJECT_REF} -o json --reveal`, {
    encoding: "utf8",
  });
  const key = JSON.parse(out).find((k) => k.id === "service_role")?.api_key;
  if (!key) throw new Error("Could not read the service key. Sign in with `npx supabase login` or set SUPABASE_SERVICE_ROLE_KEY.");
  return key;
}

export function adminClient(serviceKey = readServiceKey()) {
  return createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
}
