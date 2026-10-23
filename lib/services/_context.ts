import { createAdminClient, type Db, type UserRole } from "@/lib/data";
import { logError } from "@/lib/observability";

/** Everything a service needs about a signed-in caller. Built once per request by the HTTP layer. */
export interface RequestContext {
  requestId: string;
  userId: string;
  role: UserRole;
  /** JWT-scoped client. RLS is the authorization model; trust it. */
  db: Db;
  /** Public address of the site, for links in emails. */
  siteUrl: string;
  logError: (error: unknown, extra?: Record<string, unknown>) => void;
}

/**
 * What a service gets before anyone has signed in (requesting or entering a
 * code). There is no user, so rate limits key on the email and the caller's IP.
 */
export interface PublicContext {
  requestId: string;
  db: Db;
  ip: string;
  logError: (error: unknown, extra?: Record<string, unknown>) => void;
}

/**
 * The closed, canonical list of reasons to bypass RLS. Adding one is a design
 * decision, not a convenience: it needs a line here, an entry in
 * `scripts/checks/allowlist-service-role.txt`, and a note in ACCESS.md.
 *
 *  - webhook:             inbound provider callbacks (payments, email replies); no user session
 *  - scheduled-job:       reminders and other cron work; no user session
 *  - auth-admin:          creating accounts and setting app_metadata roles (invites)
 *  - storage-signing:     signing private-bucket URLs for documents and PDFs
 *  - no-user-write-policy: tables with no authenticated write policy by design (audit_log)
 */
export type ServiceRoleReason =
  | "webhook"
  | "scheduled-job"
  | "auth-admin"
  | "storage-signing"
  | "no-user-write-policy";

export function getServiceSupabase(reason: ServiceRoleReason): Db {
  void reason; // Recorded at the call site and enforced by check:service-role.
  return createAdminClient();
}

export function contextLogError(requestId: string, userId: string | null) {
  return (error: unknown, extra: Record<string, unknown> = {}) =>
    logError(error, { requestId, userId, ...extra });
}
