# DATABASE.md

Read this before writing any code that touches the database. After any schema change, update it in the same change (CLAUDE.md "Before writing anything").

Postgres on Supabase. Migrations live in [`supabase/migrations/`](supabase/migrations/) and are applied in filename order. Authorization is row-level security; the rules are in [ACCESS.md](ACCESS.md).

## Applied by migration

### [20261022000001_foundation.sql](supabase/migrations/20261022000001_foundation.sql)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | One row per signed-in person; carries the role | `id` (= `auth.users.id`), `role` (`staff`/`buyer`/`vendor`), `email` |
| `projects` | A development, e.g. Beaver Crossing | `name` |
| `project_statuses` | A project's own ordered stages (contract signed, framing, finishes…) | `project_id`, `name`, `position`, `cutoff_date` |
| `models` | A house type within a project (corner, middle) | `project_id`, `name` |
| `houses` | One lot | `project_id`, `model_id`, `status_id`, `lot`, `address` |
| `house_buyers` | Who buys a house (many per house) | `(house_id, user_id)` |
| `trades` | A kind of work: tile, kitchen, electric | `name` |
| `vendors` | A company, with its trade; shared across projects | `name`, `trade_id` |
| `vendor_users` | People who sign in for a vendor | `(vendor_id, user_id)` |
| `project_vendors` | Which company covers a trade for a project; a model may override | `project_id`, `trade_id`, `vendor_id`, `model_id?` |
| `audit_log` | Who did what, when. Written by the service role only | `actor_id`, `action`, `entity_type`, `entity_id`, `house_id`, `details` |

**Predicates** (security definer; the only way policies ask "who is this"): `current_role_name()`, `is_staff()`, `is_house_buyer(house_id)`, `is_project_buyer(project_id)`, `is_vendor_member(vendor_id)`. Never re-inline their subqueries in a new policy.

**Pagination index:** `houses (created_at desc, id desc)`. Every paginated table needs one in the same shape.

**Realtime:** `houses` is in the `supabase_realtime` publication.

**Triggers:** `set_updated_at` on every table with `updated_at`; `on_auth_user_created` builds the profile from `app_metadata.role`.

## Planned (next migration)

Selection sheets and items (four kinds: choose one, yes/no add-on, quantity at a price each, vendor item), option rules (appear-when, dependent price), sheet-to-model-and-status attachment, selections and signatures, vendor item progress (Not started → Contacted buyer → Met with buyer → Finalized → Confirmed by office), invoices and revisions, payments, messages and documents. Vendor access to houses arrives here: a vendor sees a house only while an item for its trade is open on it.

## Conventions

- Primary keys are `uuid` with `gen_random_uuid()`. Timestamps are `timestamptz`.
- Every foreign key has an index. Every table has RLS enabled in the migration that creates it.
- Row types in `lib/data/types.ts` are hand-written until `supabase gen types` is wired; keep them in step with this file.
- Run migrations with the Supabase CLI (`supabase db push`) or paste them into the SQL editor in order. Never edit an applied migration; add a new one.
