import type { Db } from "./_supabase";
import { DataError, toDataError } from "./_errors";
import { capLimit, descCursorOrPredicate, toPage, type Page, type PageParams } from "./_pagination";
import type { ProjectDetail, ProjectRow, ProjectStageRow } from "./types";

const PROJECT_COLUMNS = "id, name, created_at";
const STAGE_COLUMNS = "id, project_id, name, position, cutoff_date, color";

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

/** A project with its stages in order. RLS decides visibility: a stranger gets null. */
export async function getProjectDetail(db: Db, projectId: string): Promise<ProjectDetail | null> {
  const { data: project, error } = await db.from("projects").select(PROJECT_COLUMNS).eq("id", projectId).maybeSingle();
  if (error) throw toDataError(error, "project");
  if (!project) return null;
  const { data: stages, error: stagesError } = await db
    .from("project_statuses")
    .select(STAGE_COLUMNS)
    .eq("project_id", projectId)
    .order("position", { ascending: true });
  if (stagesError) throw toDataError(stagesError, "project stages");
  return { ...(project as ProjectRow), stages: (stages ?? []) as ProjectStageRow[] };
}

export interface SaveProjectInput {
  projectId?: string;
  name: string;
  /** In display order. An id keeps and renames an existing stage; none adds one; a missing one is removed. */
  stages: { id?: string; name: string; cutoffDate?: string | null; color?: string | null }[];
}

/** Create or update a project and its stages in one transaction (`save_project`). Returns the project id. */
export async function saveProject(db: Db, input: SaveProjectInput): Promise<string> {
  const { data, error } = await db.rpc("save_project", {
    p_project_id: input.projectId ?? null,
    p_name: input.name,
    p_stages: input.stages.map((s) => ({ id: s.id ?? null, name: s.name, cutoff_date: s.cutoffDate ?? null, color: s.color ?? null })),
  });
  if (error) {
    if (error.code === "23503") {
      throw new DataError("conflict", "A stage that still has houses in it cannot be removed. Move those houses to another stage first.", { cause: error });
    }
    throw toDataError(error, "project");
  }
  return data as string;
}
