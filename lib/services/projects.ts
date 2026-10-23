import { insertProject, listProjects as listProjectsData, type Page, type ProjectRow } from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createProjectInput, listPageInput, parseOrThrow } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { assertStaff } from "./access";
import { recordAudit } from "./audit";

/** Every project. Staff only (a buyer or vendor reaches their house, not the project list). */
export async function listProjects(ctx: RequestContext, raw: unknown): Promise<Page<ProjectRow>> {
  const input = parseOrThrow(listPageInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("projects-read", ctx.userId);
  return listProjectsData(ctx.db, input);
}

export async function createProject(ctx: RequestContext, raw: unknown): Promise<ProjectRow> {
  const input = parseOrThrow(createProjectInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("projects-write", ctx.userId);
  const project = await insertProject(ctx.db, input.name);
  await recordAudit(ctx, { action: "project.created", entityType: "project", entityId: project.id, details: { name: project.name } });
  return project;
}
