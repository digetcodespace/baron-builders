import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import { capLimit, descCursorOrPredicate, toPage, type Page, type PageParams } from "./_pagination";
import type { ProjectRow } from "./types";

const PROJECT_COLUMNS = "id, name, created_at";

export async function listProjects(db: Db, params: PageParams = {}): Promise<Page<ProjectRow>> {
  const limit = capLimit(params.limit);
  let query = db
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  const cursorFilter = descCursorOrPredicate(params.cursor);
  if (cursorFilter) query = query.or(cursorFilter);
  const { data, error } = await query;
  if (error) throw toDataError(error, "projects");
  return toPage((data ?? []) as ProjectRow[], limit);
}

export async function insertProject(db: Db, name: string): Promise<ProjectRow> {
  const { data, error } = await db.from("projects").insert({ name }).select(PROJECT_COLUMNS).single();
  if (error) throw toDataError(error, "project");
  return data as ProjectRow;
}
