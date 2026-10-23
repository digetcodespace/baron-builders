import { getProfile, listProfiles, type Page, type ProfileRow } from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { listPageInput, parseOrThrow } from "@/lib/validation";
import type { RequestContext } from "./_context";
import { UnauthorizedError } from "./_errors";
import { assertStaff } from "./access";

/** The signed-in person's own profile, for the account menu. */
export async function getMyProfile(ctx: RequestContext): Promise<ProfileRow> {
  const profile = await getProfile(ctx.db, ctx.userId);
  if (!profile) throw new UnauthorizedError("Your account has no access yet");
  return profile;
}

/** Everyone with an account. Staff only. */
export async function listPeople(ctx: RequestContext, raw: unknown): Promise<Page<ProfileRow>> {
  const input = parseOrThrow(listPageInput, raw);
  assertStaff(ctx);
  await enforceRateLimit("people-read", ctx.userId);
  return listProfiles(ctx.db, input);
}
