import { DataError, endSession, sendSignInCode, verifySignInCode, type UserRole } from "@/lib/data";
import { RateLimitError, enforceRateLimit } from "@/lib/rate-limit";
import { parseOrThrow, requestCodeInput, verifyCodeInput } from "@/lib/validation";
import type { PublicContext, RequestContext } from "./_context";
import { BadRequestError, ForbiddenError, InternalError } from "./_errors";

/**
 * Ask for a sign-in code. The answer is identical whether or not the address
 * has an account, so this cannot be used to discover who is registered.
 */
export async function requestSignInCode(ctx: PublicContext, raw: unknown): Promise<{ ok: true }> {
  const { email } = parseOrThrow(requestCodeInput, raw);
  await enforceRateLimit("otp-request", `${email}|${ctx.ip}`);
  try {
    await sendSignInCode(ctx.db, email);
  } catch (error) {
    if (error instanceof DataError && error.code === "rate_limited") throw new RateLimitError(60);
    ctx.logError(error, { step: "send-sign-in-code" });
    throw new InternalError("We could not send a code. Try again in a moment.");
  }
  return { ok: true };
}

/** Exchange the emailed code for a session and report where the person belongs. */
export async function verifySignInCodeForSession(ctx: PublicContext, raw: unknown): Promise<{ role: UserRole }> {
  const { email, code } = parseOrThrow(verifyCodeInput, raw);
  await enforceRateLimit("otp-verify", `${email}|${ctx.ip}`);
  let result: { userId: string; role: UserRole | null };
  try {
    result = await verifySignInCode(ctx.db, email, code);
  } catch (error) {
    if (error instanceof DataError && error.code === "auth_failed") {
      throw new BadRequestError("That code is incorrect or has expired. Request a new one.", "code");
    }
    if (error instanceof DataError && error.code === "rate_limited") throw new RateLimitError(60);
    ctx.logError(error, { step: "verify-sign-in-code" });
    throw new InternalError("We could not check that code. Try again in a moment.");
  }
  if (!result.role) {
    // A session exists but the account has no role: nothing in the app would work, so end it.
    await endSession(ctx.db);
    throw new ForbiddenError("Your account has no access yet. Contact the Baron Builders office.");
  }
  return { role: result.role };
}

export async function signOut(ctx: Pick<RequestContext | PublicContext, "db">): Promise<void> {
  await endSession(ctx.db);
}
