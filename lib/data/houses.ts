import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import { capLimit, descCursorOrPredicate, toPage, type Page, type PageParams } from "./_pagination";
import type { HouseRow } from "./types";

const HOUSE_COLUMNS = "id, project_id, model_id, status_id, lot, address, created_at";

export interface ListHousesParams extends PageParams {
  projectId?: string;
}

export async function listHouses(db: Db, params: ListHousesParams = {}): Promise<Page<HouseRow>> {
  const limit = capLimit(params.limit);
  let query = db
    .from("houses")
    .select(HOUSE_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (params.projectId) query = query.eq("project_id", params.projectId);
  const cursorFilter = descCursorOrPredicate(params.cursor);
  if (cursorFilter) query = query.or(cursorFilter);

  const { data, error } = await query;
  if (error) throw toDataError(error, "houses");
  return toPage((data ?? []) as HouseRow[], limit);
}

/** RLS decides visibility: a stranger gets null, not an error. */
export async function getHouse(db: Db, houseId: string): Promise<HouseRow | null> {
  const { data, error } = await db.from("houses").select(HOUSE_COLUMNS).eq("id", houseId).maybeSingle();
  if (error) throw toDataError(error, "house");
  return data as HouseRow | null;
}

export async function isHouseBuyer(db: Db, houseId: string, userId: string): Promise<boolean> {
  const { count, error } = await db
    .from("house_buyers")
    .select("house_id", { count: "exact", head: true })
    .eq("house_id", houseId)
    .eq("user_id", userId);
  if (error) throw toDataError(error, "house buyer");
  return (count ?? 0) > 0;
}

/** Link a buyer to their house. Idempotent. */
export async function addHouseBuyer(db: Db, houseId: string, userId: string): Promise<void> {
  const { error } = await db
    .from("house_buyers")
    .upsert({ house_id: houseId, user_id: userId }, { onConflict: "house_id,user_id", ignoreDuplicates: true });
  if (error) throw toDataError(error, "house buyer");
}
