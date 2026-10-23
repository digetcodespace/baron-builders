import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import type { AuditEntryInput } from "./types";

/** `audit_log` has no user write policy by design; callers pass the service-role client. */
export async function insertAuditEntry(db: Db, entry: AuditEntryInput): Promise<void> {
  const { error } = await db.from("audit_log").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    house_id: entry.houseId ?? null,
    details: entry.details ?? {},
  });
  if (error) throw toDataError(error, "audit entry");
}
