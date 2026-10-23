import type { Db } from "./_supabase";
import { toDataError } from "./_errors";
import { capLimit, descCursorOrPredicate, toPage, type Page, type PageParams } from "./_pagination";
import type { VendorRow } from "./types";

const VENDOR_COLUMNS = "id, name, trade_id, email, phone, created_at";

export async function listVendors(db: Db, params: PageParams = {}): Promise<Page<VendorRow>> {
  const limit = capLimit(params.limit);
  let query = db
    .from("vendors")
    .select(VENDOR_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  const cursorFilter = descCursorOrPredicate(params.cursor);
  if (cursorFilter) query = query.or(cursorFilter);
  const { data, error } = await query;
  if (error) throw toDataError(error, "vendors");
  return toPage((data ?? []) as VendorRow[], limit);
}

export async function getVendor(db: Db, vendorId: string): Promise<VendorRow | null> {
  const { data, error } = await db.from("vendors").select(VENDOR_COLUMNS).eq("id", vendorId).maybeSingle();
  if (error) throw toDataError(error, "vendor");
  return data as VendorRow | null;
}

/** Link a person to the company they sign in for. Idempotent. */
export async function addVendorUser(db: Db, vendorId: string, userId: string): Promise<void> {
  const { error } = await db
    .from("vendor_users")
    .upsert({ vendor_id: vendorId, user_id: userId }, { onConflict: "vendor_id,user_id", ignoreDuplicates: true });
  if (error) throw toDataError(error, "vendor member");
}
