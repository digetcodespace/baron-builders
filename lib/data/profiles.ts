import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import type { ProfileRow } from "./types";

export async function getProfile(db: Db, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await db
    .from("profiles")
    .select("id, role, email, full_name, phone, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw toDataError(error, "profile");
  return data as ProfileRow | null;
}
