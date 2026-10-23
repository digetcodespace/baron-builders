import {
  countHouseTypeUsage,
  deleteHouseType as deleteHouseTypeData,
  getHouseType,
  getProjectDetail,
  insertHouseType,
  listHouseTypes as listHouseTypesData,
  renameHouseType as renameHouseTypeData,
  type HouseTypeRow,
  type Page,
} from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createHouseTypeInput, houseTypeIdInput, listHouseTypesInput, parseOrThrow, renameHouseTypeInput } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { ConflictError, NotFoundError } from "./_errors";
import { assertStaff } from "./access";
import { recordAudit } from "./audit";

/** A project's house types. Staff only. */
export async function listHouseTypes(ctx: RequestContext, raw: unknown): Promise<Page<HouseTypeRow>> {
  const input = parseOrThrow(listHouseTypesInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("house-types-read", ctx.userId);
  return listHouseTypesData(ctx.db, input);
}

export async function createHouseType(ctx: RequestContext, raw: unknown): Promise<HouseTypeRow> {
  const input = parseOrThrow(createHouseTypeInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("house-types-write", ctx.userId);
  if (!(await getProjectDetail(ctx.db, input.projectId))) throw new NotFoundError("Project not found");
  const created = await insertHouseType(ctx.db, input.projectId, input.name);
  await recordAudit(ctx, { action: "house_type.created", entityType: "house_type", entityId: created.id, details: { name: created.name, projectId: input.projectId } });
  return created;
}

export async function renameHouseType(ctx: RequestContext, raw: unknown): Promise<HouseTypeRow> {
  const input = parseOrThrow(renameHouseTypeInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("house-types-write", ctx.userId);
  if (!(await getHouseType(ctx.db, input.houseTypeId))) throw new NotFoundError("House type not found");
  const renamed = await renameHouseTypeData(ctx.db, input.houseTypeId, input.name);
  await recordAudit(ctx, { action: "house_type.renamed", entityType: "house_type", entityId: renamed.id, details: { name: renamed.name } });
  return renamed;
}

/** Remove a house type that nothing uses. A type with houses or sheets is refused, never cascaded. */
export async function deleteHouseType(ctx: RequestContext, raw: unknown): Promise<void> {
  const { houseTypeId } = parseOrThrow(houseTypeIdInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("house-types-write", ctx.userId);
  const existing = await getHouseType(ctx.db, houseTypeId);
  if (!existing) throw new NotFoundError("House type not found");
  const usage = await countHouseTypeUsage(ctx.db, houseTypeId);
  if (usage.houses > 0) {
    throw new ConflictError(`${existing.name} has ${usage.houses} ${usage.houses === 1 ? "house" : "houses"}. Move them to another house type first.`);
  }
  if (usage.sheets > 0) {
    throw new ConflictError(`${existing.name} has ${usage.sheets} ${usage.sheets === 1 ? "sheet" : "sheets"}. Remove them first.`);
  }
  await deleteHouseTypeData(ctx.db, houseTypeId);
  await recordAudit(ctx, { action: "house_type.deleted", entityType: "house_type", entityId: houseTypeId, details: { name: existing.name, projectId: existing.project_id } });
}
