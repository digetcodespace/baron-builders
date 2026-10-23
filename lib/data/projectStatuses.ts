import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import type { ProjectStatusRow } from "./types";

/** Every stage of the given projects, in order. Bounded: a project has a handful of stages. */
export async function listProjectStatuses(db: Db, projectIds: string[]): Promise<ProjectStatusRow[]> {
  if (projectIds.length === 0) return [];
  const { data, error } = await db
    .from("project_statuses")
    .select("id, project_id, name, position")
    .in("project_id", projectIds)
    .order("position", { ascending: true });
  if (error) throw toDataError(error, "project statuses");
  return (data ?? []) as ProjectStatusRow[];
}
