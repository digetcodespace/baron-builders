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

export interface ProjectStageRow {
  id: string;
  project_id: string;
  name: string;
  position: number;
  cutoff_date: string | null;
}

/** A project with its stages, in order. */
export interface ProjectDetail extends ProjectRow {
  stages: ProjectStageRow[];
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

export interface ProjectStatusRow {
  id: string;
  project_id: string;
  name: string;
  position: number;
}

/** Where a house is in its project's stages: its status name, its place in the order, and how many stages there are. */
export interface HouseStage {
  name: string;
  step: number;
  steps: number;
}

export interface HouseWithStage extends HouseRow {
  stage: HouseStage | null;
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
