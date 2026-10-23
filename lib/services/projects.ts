import { getProjectDetail, listProjects as listProjectsData, saveProject, type Page, type ProjectDetail, type ProjectRow } from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { listPageInput, parseOrThrow, projectIdInput, saveProjectInput } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { NotFoundError } from "./_errors";
import { assertStaff } from "./access";
import { recordAudit } from "./audit";

/** Every project. Staff only (a buyer or vendor reaches their house, not the project list). */
export async function listProjects(ctx: RequestContext, raw: unknown): Promise<Page<ProjectRow>> {
  const input = parseOrThrow(listPageInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("projects-read", ctx.userId);
  return listProjectsData(ctx.db, input);
}

export async function getProject(ctx: RequestContext, raw: unknown): Promise<ProjectDetail> {
  const { projectId } = parseOrThrow(projectIdInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("projects-read", ctx.userId);
  const project = await getProjectDetail(ctx.db, projectId);
  if (!project) throw new NotFoundError("Project not found");
  return project;
}

/** Create a project (no `projectId`) or update one: its name and its stages, in order, in one save. */
export async function saveProjectWithStages(ctx: RequestContext, raw: unknown): Promise<ProjectDetail> {
  const input = parseOrThrow(saveProjectInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("projects-write", ctx.userId);
  if (input.projectId && !(await getProjectDetail(ctx.db, input.projectId))) throw new NotFoundError("Project not found");

  const projectId = await saveProject(ctx.db, input);
  const saved = await getProjectDetail(ctx.db, projectId);
  if (!saved) throw new NotFoundError("Project not found");
  await recordAudit(ctx, {
    action: input.projectId ? "project.updated" : "project.created",
    entityType: "project",
    entityId: projectId,
    details: { name: saved.name, stages: saved.stages.map((s) => s.name) },
  });
  return saved;
}
