import { getHouse, listHouses as listHousesData, type HouseRow, type Page } from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { houseIdInput, listHousesInput, parseOrThrow } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { ForbiddenError, NotFoundError } from "./_errors";

/** Staff see every house; buyers see theirs. RLS enforces both; the role check rejects vendors early. */
export async function listHouses(ctx: RequestContext, raw: unknown): Promise<Page<HouseRow>> {
  const input = parseOrThrow(listHousesInput, raw);
  await enforceRateLimit("houses-read", ctx.userId);
  if (ctx.role === "vendor") throw new ForbiddenError();
  return listHousesData(ctx.db, input);
}

export async function getHouseById(ctx: RequestContext, raw: unknown): Promise<HouseRow> {
  const { houseId } = parseOrThrow(houseIdInput, raw);
  await enforceRateLimit("houses-read", ctx.userId);
  if (ctx.role === "vendor") throw new ForbiddenError();
  // RLS returns null for a house the caller cannot see, so a stranger cannot tell
  // "does not exist" from "not yours".
  const house = await getHouse(ctx.db, houseId);
  if (!house) throw new NotFoundError("House not found");
  return house;
}
