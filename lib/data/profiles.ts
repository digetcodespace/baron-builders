import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import { capLimit, descCursorOrPredicate, toPage, type Page, type PageParams } from "./_pagination";
import type { ProfileRow } from "./types";

const PROFILE_COLUMNS = "id, role, email, full_name, phone, created_at";

export async function getProfile(db: Db, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await db.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
  if (error) throw toDataError(error, "profile");
  return data as ProfileRow | null;
}

export async function getProfileByEmail(db: Db, email: string): Promise<ProfileRow | null> {
  const { data, error } = await db.from("profiles").select(PROFILE_COLUMNS).eq("email", email).maybeSingle();
  if (error) throw toDataError(error, "profile");
  return data as ProfileRow | null;
}

export async function listProfiles(db: Db, params: PageParams = {}): Promise<Page<ProfileRow>> {
  const limit = capLimit(params.limit);
  let query = db
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  const cursorFilter = descCursorOrPredicate(params.cursor);
  if (cursorFilter) query = query.or(cursorFilter);
  const { data, error } = await query;
  if (error) throw toDataError(error, "people");
  return toPage((data ?? []) as ProfileRow[], limit);
}
