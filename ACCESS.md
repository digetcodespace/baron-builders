# ACCESS.md

Who can see and do what. Read this before adding a table, a policy, or an authorization check (CLAUDE.md "Roles and authorization"). Source: the Baron Builders Selections Portal proposal, October 14, 2026.

## Roles

| Role | Who | Portal | Enforced by |
| --- | --- | --- | --- |
| `staff` | The Baron Builders team | `/staff` | `profiles.role = 'staff'`, `is_staff()` |
| `buyer` | The buyers of one house (a house can have several, each with their own sign-in) | `/buyer` | `house_buyers`, `is_house_buyer(house_id)` |
| `vendor` | Outside trades, e.g. tile or electrical | `/vendor` | `vendor_users`, `is_vendor_member(vendor_id)` |

A role is set once, in the user's `app_metadata.role` when staff invite them (only the server can write it). The `on_auth_user_created` trigger turns it into a `profiles` row. A user with no role has no profile and no access.

**The role is in the sign-in token.** Supabase runs `custom_access_token_hook` every time it issues or refreshes a token and adds the claim `user_role`. The token is signed by Supabase, so the claim cannot be forged or edited. Row-level security (`current_role_name()`) and the app's request context both read it, with a database lookup only as the fallback for tokens issued before the hook existed.

**Trade-off:** a role change takes effect when the person's token next refreshes (up to `jwt_expiry`, 1 hour). To cut someone off immediately, remove their profile *and* end their sessions with the auth admin API; removing the profile alone leaves a still-valid token working until it expires. Keep the expiry short, and never grant a role without a profile.

## Signing in and being invited

- **One sign-in page for everyone** (`/sign-in`). A person enters their email, receives an 8-digit one-time code, and enters it. There is no password. Staff, buyers, and vendors use the same page and land in their own portal.
- **Accounts exist only by invitation.** Public sign-up is switched off on the Supabase project and `shouldCreateUser` is false on every code request, so a stranger's address never becomes an account. The first staff account is created with `npm run create-staff`; after that, staff invite everyone else from the People page (`/staff/people`).
- **An invitation sets the role on the server** (`app_metadata.role`, which only the server can write) and links the person to what they belong to: a buyer to one house, a vendor person to their company. Inviting an email that already has a different role is refused; roles are never changed by inviting.
- **Asking for a code never reveals who has an account.** The answer is the same for a registered address and a stranger's. Codes and attempts are rate limited per email and IP (5 requests and 10 attempts per 10 minutes).
- **Redirects happen at the gate.** The proxy reads the role from the signed token: a signed-out visitor is sent to sign-in, a person in the wrong portal is sent to their own, and a signed-in person who opens sign-in is sent home, all as instant redirects. Each portal layout checks the role again, so the proxy is a convenience and a first gate, never the only one.
- **State-changing requests must come from this site** (`Origin` is checked), and the API uses the same error pipeline as everything else.
- **Revoking access:** delete the person's account (their token stays valid until it expires, up to an hour). Changing a role is a deliberate server action, not an invitation.

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

[Foundation](supabase/migrations/20261022000001_foundation.sql) covers staff and buyer access to projects and houses, a vendor's own company, and the audit log.

[Sheets, selections, and vendor items](supabase/migrations/20261022000002_sheets_selections_vendor_items.sql) adds:
- Buyers read a sheet once their house reaches its status, and pick only on their own house until the sheet is signed.
- Vendors read only houses with an open item for their company, the buyers' contact details on those houses, and their own items. They never reach selections, prices, or invoices.
- Signing goes only through `sign_sheet()` (service role), and signed selections are locked for everyone.

Three migrations are applied, and `npm run db:test` runs the stranger test (34 checks: staff, two buyers, two vendors on different trades, and a user with no profile) against the live database. Invoices, payments, and messages come next.
