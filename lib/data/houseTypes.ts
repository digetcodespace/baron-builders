import type { Db } from "./_supabase";
import { DataError, toDataError } from "./_errors";
import { capLimit, descCursorOrPredicate, toPage, type Page, type PageParams } from "./_pagination";
import type { HouseTypeRow } from "./types";

const COLUMNS = "id, project_id, name, created_at, houses(count)";

interface RawHouseType {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  houses: { count: number }[] | null;
}

function toRow(raw: RawHouseType): HouseTypeRow {
  return { id: raw.id, project_id: raw.project_id, name: raw.name, created_at: raw.created_at, house_count: raw.houses?.[0]?.count ?? 0 };
}

export interface ListHouseTypesParams extends PageParams {
  projectId: string;
}

/** A project's house types, newest first, each with how many houses use it. */
export async function listHouseTypes(db: Db, params: ListHouseTypesParams): Promise<Page<HouseTypeRow>> {
  const limit = capLimit(params.limit);
  let query = db
    .from("models")
    .select(COLUMNS)
    .eq("project_id", params.projectId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  const cursorFilter = descCursorOrPredicate(params.cursor);
  if (cursorFilter) query = query.or(cursorFilter);
  const { data, error } = await query;
  if (error) throw toDataError(error, "house types");
  return toPage(((data ?? []) as unknown as RawHouseType[]).map(toRow), limit);
}

/** RLS decides visibility: a stranger gets null. */
export async function getHouseType(db: Db, houseTypeId: string): Promise<HouseTypeRow | null> {
  const { data, error } = await db.from("models").select(COLUMNS).eq("id", houseTypeId).maybeSingle();
  if (error) throw toDataError(error, "house type");
  return data ? toRow(data as unknown as RawHouseType) : null;
}

function nameConflict(error: { code?: string; message: string }, name: string): DataError | null {
  return error.code === "23505" ? new DataError("conflict", `This project already has a house type called "${name}".`, { cause: error }) : null;
}

export async function insertHouseType(db: Db, projectId: string, name: string): Promise<HouseTypeRow> {
  const { data, error } = await db.from("models").insert({ project_id: projectId, name }).select(COLUMNS).single();
  if (error) throw nameConflict(error, name) ?? toDataError(error, "house type");
  return toRow(data as unknown as RawHouseType);
}

export async function renameHouseType(db: Db, houseTypeId: string, name: string): Promise<HouseTypeRow> {
  const { data, error } = await db.from("models").update({ name }).eq("id", houseTypeId).select(COLUMNS).single();
  if (error) throw nameConflict(error, name) ?? toDataError(error, "house type");
  return toRow(data as unknown as RawHouseType);
}

/** How much hangs off a house type: deleting is refused while either count is above zero. */
export async function countHouseTypeUsage(db: Db, houseTypeId: string): Promise<{ houses: number; sheets: number }> {
  const [houses, sheets] = await Promise.all([
    db.from("houses").select("id", { count: "exact", head: true }).eq("model_id", houseTypeId),
    db.from("sheets").select("id", { count: "exact", head: true }).eq("model_id", houseTypeId),
  ]);
  if (houses.error) throw toDataError(houses.error, "house type");
  if (sheets.error) throw toDataError(sheets.error, "house type");
  return { houses: houses.count ?? 0, sheets: sheets.count ?? 0 };
}

export async function deleteHouseType(db: Db, houseTypeId: string): Promise<void> {
  const { error } = await db.from("models").delete().eq("id", houseTypeId);
  if (error) throw toDataError(error, "house type");
}
