import { isHouseBuyer } from "@/lib/data";
import type { RequestContext } from "./_context";
import { ForbiddenError } from "./_errors";

/**
 * The only authorization helpers. Never hand-roll `row.user_id !== ctx.userId`.
 * On paths that use the service-role client these are the *only* authorization.
 */

export function assertStaff(ctx: Pick<RequestContext, "role">): void {
  if (ctx.role !== "staff") throw new ForbiddenError("Staff only");
}

/** Staff may open any house; a buyer only their own. Vendors reach houses through vendor items, not here. */
export async function assertHouseAccess(
  ctx: Pick<RequestContext, "role" | "userId" | "db">,
  houseId: string,
): Promise<void> {
  if (ctx.role === "staff") return;
  if (ctx.role === "buyer" && (await isHouseBuyer(ctx.db, houseId, ctx.userId))) return;
  throw new ForbiddenError();
}
