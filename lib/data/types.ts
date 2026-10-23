/** Row shapes. Hand-written until `supabase gen types` is wired (see DATABASE.md). */

export type UserRole = "staff" | "buyer" | "vendor";

export interface ProfileRow {
  id: string;
  role: UserRole;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface VendorRow {
  id: string;
  name: string;
  trade_id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  created_at: string;
}

export interface HouseRow {
  id: string;
  project_id: string;
  model_id: string;
  status_id: string;
  lot: string;
  address: string | null;
  created_at: string;
}

export interface AuditEntryInput {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  houseId?: string | null;
  details?: Record<string, unknown>;
}

export type ItemKind = "choice" | "addon" | "quantity" | "vendor";

export type VendorStage =
  | "not_started"
  | "contacted_buyer"
  | "met_with_buyer"
  | "finalized"
  | "confirmed_by_office";
