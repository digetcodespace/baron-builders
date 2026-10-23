import { insertAuditEntry, type AuditEntryInput } from "@/lib/data";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getServiceSupabase, type RequestContext } from "./_context";

/**
 * Every choice, signature, change, email, and payment is recorded with who and
 * when. Call this from the same service function that makes the change, so the
 * audit row cannot be skipped.
 */
export async function recordAudit(
  ctx: Pick<RequestContext, "userId">,
  entry: Omit<AuditEntryInput, "actorId">,
): Promise<void> {
  await enforceRateLimit("audit-write", ctx.userId);
  await insertAuditEntry(getServiceSupabase("no-user-write-policy"), { ...entry, actorId: ctx.userId });
}
