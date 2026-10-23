import { listVendors as listVendorsData, type Page, type VendorRow } from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { listPageInput, parseOrThrow } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { assertStaff } from "./access";

/** The shared vendor list (companies, each with a trade). Staff only. */
export async function listVendors(ctx: RequestContext, raw: unknown): Promise<Page<VendorRow>> {
  const input = parseOrThrow(listPageInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("people-read", ctx.userId);
  return listVendorsData(ctx.db, input);
}
