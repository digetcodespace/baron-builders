# ACCESS.md

Who can see and do what. Read this before adding a table, a policy, or an authorization check (CLAUDE.md "Roles and authorization"). Source: the Baron Builders Selections Portal proposal, October 14, 2026.

## Roles

| Role | Who | Portal | Enforced by |
| --- | --- | --- | --- |
| `staff` | The Baron Builders team | `/staff` | `profiles.role = 'staff'`, `is_staff()` |
| `buyer` | The buyers of one house (a house can have several, each with their own sign-in) | `/buyer` | `house_buyers`, `is_house_buyer(house_id)` |
| `vendor` | Outside trades, e.g. tile or electrical | `/vendor` | `vendor_users`, `is_vendor_member(vendor_id)` |

A role is set once, in the user's `app_metadata.role` when staff invite them (only the server can write it). The `on_auth_user_created` trigger turns it into a `profiles` row. A user with no role has no profile and no access.

## What each role can see

| Data | Staff | Buyer | Vendor |
| --- | --- | --- | --- |
| Projects, models, statuses | All | Only those of their own house's project | None (yet) |
| Houses | All | Only their own house | Only houses where an item for their trade is open (arrives with sheets) |
| Buyers on a house | All | Their own row | Contact details of the buyers on houses they can see (arrives with sheets) |
| Selection sheets and the buyer's choices | All | Their own house's sheets | Never the buyer's other choices |
| Prices, invoices, payments | All | Their own house | **Never** |
| Vendor items and progress | All; staff can correct a stage | Their own house's, read-only | Their own trade's, on their houses; they move their own stage |
| Messages | All, filed to the house | Their own house's | Their own thread with the office |
| Vendors and trades | All | None | Their own company |
| Audit log | Read | None | None |

## What each role can do

| Action | Staff | Buyer | Vendor |
| --- | --- | --- | --- |
| Set up projects, models, statuses, sheets, vendors, staff accounts | Yes | No | No |
| Move a house to a new status (opens its sheet, emails the buyers) | Yes | No | No |
| Fill out an open sheet, sign, pay | No | Yes (own house) | No |
| Request a change after signing | No | Yes (own house) | No |
| Fill a vendor item and move it Contacted → Met → Finalized | No | No | Yes (own trade, own houses) |
| Confirm a finalized vendor item | Yes | No | No |
| Email buyers from the system | Yes | No | No |

## Rules that must hold

1. **A buyer can never open another house, even by changing a link.** Enforced twice: RLS on every table, and `assertHouseAccess` in services. A stranger gets "not found", never "forbidden", so existence does not leak.
2. **A vendor never receives prices, invoices, or a buyer's other choices.** Strip them in the service that builds the vendor's response, not in the component.
3. **Signed sheets are locked.** Prices freeze for that buyer once signed. A change after signing is a new revision (a revised invoice or a credit), never an edit in place.
4. **Irreversible and outward-facing acts stay with staff** (delete a project, invoice, send email).
5. **Every choice, signature, change, email, and payment is audited** with who and when, written in the same service function as the change (`recordAudit`).
6. **The service-role client is a closed list**: `webhook`, `scheduled-job`, `auth-admin`, `storage-signing`, `no-user-write-policy`. See `ServiceRoleReason` in `lib/services/_context.ts` and `scripts/checks/allowlist-service-role.txt`.

## The stranger test

Every access change ships with tests for: a buyer on a different house, a buyer on no house, a vendor on a different trade, and a user with no profile. Widening access is never one change: validate the write and the read under the same scope, or you ship rows nobody can resolve.

## Status

Foundation migration ([20261022000001_foundation.sql](supabase/migrations/20261022000001_foundation.sql)) covers staff and buyer access to projects and houses, vendor access to their own company, and the audit log. Vendor access to houses, and everything about sheets, selections, invoices, and payments, lands in the next migration.
