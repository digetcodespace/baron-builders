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

### [20261022000002_sheets_selections_vendor_items.sql](supabase/migrations/20261022000002_sheets_selections_vendor_items.sql)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `sheets` | One per model per status; a status may have none | `model_id`, `status_id`, `name`; unique `(model_id, status_id)` |
| `sheet_sections` | Groups on a sheet (Kitchen, Doors, Paint) | `sheet_id`, `name`, `position` |
| `sheet_items` | An item on a sheet. Four kinds: `choice`, `addon`, `quantity`, `vendor` | `kind`, `base_price_cents`, `min_quantity`, `max_quantity`, `trade_id`, `visible_when_option_id` |
| `item_options` | The options of a choice item | `item_id`, `price_cents`, `visible_when_option_id` |
| `price_rules` | An option's or item's price when another option is chosen | `option_id` xor `item_id`, `when_option_id`, `price_cents` |
| `vendor_item_fields` | What a vendor must enter (text or a PDF) | `item_id`, `label`, `field_type` |
| `selections` | A buyer's pick: one row per house per item | `option_id` (choice), `is_selected` (add-on), `quantity`, `unit_price_cents` (set at signing) |
| `sheet_signatures` | A sheet signed by a house, with its total | unique `(house_id, sheet_id)`, `total_cents` |
| `vendor_item_progress` | A vendor item on a house: stage and the assigned vendor | `house_id`, `item_id`, `vendor_id`, `stage`, `due_date` |
| `vendor_item_events` | Each stage change with date and note | `progress_id`, `stage`, `occurred_on`, `note` |
| `vendor_item_values` | What the vendor entered; a file is a server-only storage path | `progress_id`, `field_id`, `text_value`, `file_path` |

Also adds `vendors.email` and `vendors.phone` (the contact details a buyer sees).

**Rules in the data.** Prices are integer cents. A vendor item carries no price (a check constraint), so a vendor who reads the row never sees one. An option or item can appear only when another option is chosen (`visible_when_option_id`), and its price can depend on another choice (`price_rules`).

**Signing.** `sign_sheet(house, sheet, signer, total, prices)` is the only writer of `sheet_signatures`. It snapshots each selection's price and writes the signature in one transaction, and it is granted to the service role only. The application computes the total (price math has one home, in TypeScript). After signing, a trigger blocks every insert, update, and delete on that sheet's selections, staff included: a change is a new revision, not an edit. Side effect: a house with a signed sheet cannot be deleted.

**Vendor stages.** `not_started` → `contacted_buyer` → `met_with_buyer` → `finalized` → `confirmed_by_office`. A trigger lets a vendor move a stage forward only and never to `confirmed_by_office`; only staff confirm, correct a stage, or reassign. `vendor_item_events` is append-only for everyone but staff.

**Open vendor item.** A vendor sees a house while a `vendor_item_progress` row for its company exists on it with a stage other than `confirmed_by_office`. The service creates those rows, resolving the vendor from `project_vendors` (the model's company if set, otherwise the project's), when staff move a house to the sheet's status.

**Predicates added:** `buyer_can_see_sheet`, `is_house_vendor`, `is_vendor_progress`, `is_vendor_item`, `is_vendor_status`, `vendor_can_see_buyer`, `buyer_sees_vendor`, `buyer_sees_progress`, `sheet_is_signed`, plus the lookups `item_sheet_id` and `option_sheet_id`.

**Realtime:** `selections`, `vendor_item_progress`, and `sheet_signatures` join the `supabase_realtime` publication.

**Status: applied** to the Baron Builders project on 2026-10-22, and the stranger test (`supabase/tests/stranger.sql`, 26 checks) passes against it.

## Planned (next migration)

Invoices and revisions (a change after signing produces a revised invoice or a credit), payments, messages and documents, and reminders.

## Conventions

- Primary keys are `uuid` with `gen_random_uuid()`. Timestamps are `timestamptz`.
- Every foreign key has an index. Every table has RLS enabled in the migration that creates it.
- Row types in `lib/data/types.ts` are hand-written until `supabase gen types` is wired; keep them in step with this file.
- Run migrations with the Supabase CLI (`supabase db push`) or paste them into the SQL editor in order. Never edit an applied migration; add a new one.
