# CLAUDE.md — Structural rules

Permanent rules for where code goes and what to reuse. `AGENTS.md` describes the *current implementation*; this file holds the structure that stays true however the implementation changes.

Baron Builders is a selections portal: one system takes every house from contract to signed, paid selections. Product spec: the "Come on in" proposal (Diget Group, October 14, 2026). Three user types sign in on one page and each gets its own portal: **staff** (Baron Builders team), **buyers** (the buyers of one house), and **vendors** (outside trades such as tile or electrical).

Every rule here is only worth having if a script or review can enforce it — add a `check:*` script for each one you can.

## Before writing anything

- Search for an existing implementation first. Reuse beats rewrite.
- Match the closest sibling: same folder, same shape, same naming.
- If a primitive, hook, helper, or service already does ~80% of the job, extend it. Do not fork it.
- Before touching the database, read `DATABASE.md`. After any schema change, update it immediately.

## Layering

Three layers. Imports go down, never up or sideways.

- **HTTP layer** (route handlers, pages): parse the request, call a service, return the response. No business logic. No direct database access.
- **Service layer** (`lib/services/**`): all business logic. Receives a request context, returns plain data, throws typed errors. Never imports from the HTTP layer. Never reads env vars directly. Never returns HTTP responses.
- **Data layer** (`lib/data/**`): all database, storage, and realtime queries. Throws typed errors. Knows nothing about HTTP, sessions, or business rules.

Public surface of each layer is its `index.ts` barrel. Reach for it first. Two sanctioned departures, neither a licence to freelance:

- **More than one entry point** only when the entry points serve genuinely different runtimes (server vs. client barrel) or genuinely different authentication mechanisms (e.g. a session-gated services barrel vs. an ungated "core" for a bearer-token consumer). Nothing crosses: a core is never re-exported from the gated barrel, and a check pins the one sanctioned consumer. An ungated entry point is a real cost; it exists only because the alternative was forking write logic into a second implementation that drifts.
- **A registry of mutually exclusive alternatives** (providers, executors) may skip the barrel so importing one doesn't load them all.

Underscore-prefixed modules (`_cached.ts`, `_errors.ts`) are private to their folder. If you're deep-importing a symbol that is *not* underscore-private, the barrel is missing an export — fix the barrel, don't route around it.

## Where things live (one home each)

- **Business logic** → services. Logic in a route, component, or hook is in the wrong place.
- **Database / storage / realtime queries** → data layer. Nothing else opens a DB client to talk to a table.
- **UI** → `components/`. Components get props or read a provider. They don't fetch, query, or call `/api/*`.
- **Shared types** → next to the layer that owns them. Don't re-declare types in consumers.
- **Visual constants** → the design-tokens module. Nowhere else.

## Errors — one pipeline

Typed throws on the server, one mapper to HTTP, one parser on the client, one toast/boundary surface. Never bypass it.

**Server**
- Data layer throws data errors; service layer throws service errors (`BadRequestError`, `RateLimitError`, … in one `_errors.ts`).
- Routes: `try { … } catch (err) { return toErrorResponse(err, req); }` — always pass `req` so `requestId` flows through.
- Validate input at the service boundary with `parseOrThrow(Schema, raw)`; a schema path becomes `BadRequestError.field`. No manual `if/throw` checks.
- Never invent an error shape inline. New category → new class in `_errors.ts` + a branch in `toErrorResponse`. Never `return json({ error }, { status })` ad hoc from a route.
- Webhooks and crons follow the same shape: verify the secret, then throw through the mapper. No bespoke `{ ok: false }` envelopes.
- No silent `catch {}` / `.catch(() => null)` in services. Fire-and-forget is allowed only if it logs to the error tracker.

**Client**
- Every `/api/*` fetch reads errors through one `parseApiError(res)`. No `.json().catch()` boilerplate, no hand-reading `Retry-After` or `requestId`.
- Surface every user-triggered error, chosen mechanically:
  - `field` present → inline next to the input (`<FieldError>`), not a toast.
  - 429 → sticky toast with formatted retry-after copy and a Retry action replaying the request.
  - 402 (payment required) → the one payment banner flow.
  - everything else → toast with the server message.
- One toast context and one banner component. Don't add a second toast lib.
- Background fetches (mount seeds, polls, URL refreshes) must retry with backoff or surface a one-time toast — never `console.error` and move on.
- Never auto-dismiss a retryable failure before the user can act. Never show raw provider/upstream error text; one classifier owns user-facing failure copy.

**Boundaries**
- Root, global, and each high-traffic segment `error.tsx` capture to the error tracker and display `error.digest` for support correlation. A new high-traffic segment gets its own `error.tsx`.

## Roles and authorization

Baron Builders is one company; the access boundary is the **role plus the house**, not a tenant. Write the exact matrix in `ACCESS.md` and read it before adding a table, policy, or auth check.

- **Staff** see every project and house.
- **Buyers** see only their own house (a house can have several buyers, each with their own sign-in) and that house's model sheets. A buyer can never open another house, even by changing a link.
- **Vendors** see only houses where an item for their trade is open. They never see prices, invoices, or the buyer's other choices.
- One canonical predicate per role (e.g. `is_staff()`, `is_house_buyer(house_id)`, `is_house_vendor(house_id)`). Never re-inline the membership subquery in a new policy.
- Never hand-roll `row.user_id !== ctx.userId`. Use shared `assertHouseAccess` / `assertStaff` helpers. On paths that use a privileged client (webhooks, jobs), these helpers are the *only* authorization.
- Widening access is never one change: validate writes and sign/read under the **same** scope, or you ship rows nobody can resolve, silently. Always test the stranger: a buyer on a different house, and a vendor on a different trade.
- Signed sheets are locked: prices freeze for that buyer once signed. A change after signing is a new revision (revised invoice or credit), never an edit in place.
- Record keeping: every choice, signature, change, email, and payment is saved with who and when. Writes go through the service layer so the audit row can't be skipped.

## Database changes

Whenever the database needs to change (tables, columns, policies, functions, indexes, seed data), it goes through the **Supabase CLI**, as a migration file committed to the repo.

- Create it with `supabase migration new <name>`; the SQL lives in `supabase/migrations/`.
- Test it locally with `supabase db reset`; apply it to the linked project with `supabase db push`.
- Never give the user SQL to run in the dashboard SQL editor, and never change schema by hand in the dashboard. If the dashboard and the migrations drift, the migrations are the truth.
- Regenerate types with `supabase gen types typescript` after a schema change, then update `DATABASE.md` (see "Before writing anything").

## Database clients

- One browser singleton for client-side reads and realtime. Never construct another.
- The user-JWT-scoped server client is the default for every service function. RLS is the authorization model; trust it.
- The privileged (service-role) client bypasses RLS. Using it for ordinary user-data reads is a security bug, not a shortcut. Keep a **closed, canonical list** of allowed uses in one place (no-session paths such as webhooks and scheduled jobs like reminders, the auth-admin API, private-storage signing for documents and PDFs, tables with no user write policy by design) and enforce it with a script. If RLS feels "in the way", the policy is wrong — fix it.

## Realtime

- All subscriptions go through one shared realtime hook under one shared provider. Never open a channel directly in a component.
- Prefer the table-typed wrappers. Subscriptions live in providers (or hooks called from them), not leaf components.

## Components

- No fetching, DB calls, or `/api/*` calls inside a component. Data comes from props or a provider.
- Use the component library's primitives. Don't roll a new button, modal, menu, popover, toggle, banner, pill, or input. Missing a variant? Extend the primitive; don't build a one-off beside it.
- Server components by default. `'use client'` only when state, effects, or browser APIs require it.
- **Tooltips, three tiers.** One tooltip primitive only; never a native `title` for a UI affordance. Icon-only buttons carry a tooltip by default (baked into `IconButton`; never re-wrap). Text buttons get none unless explaining a non-obvious consequence — and *always* when conditionally disabled, to say why. A field/label is explained with an info hint, not a button tooltip.
- One title surface per page (`PageHeader` or a table title) — never a hand-rolled `<h1>` cluster. Every route gets a `loading.tsx` using shared skeleton composites.
- The buyer portal is used on phones. Build it mobile-first.

## Styling

- Tailwind utilities or token-fed inline `style` objects. No other CSS framework, no UI component library, no runtime CSS-in-JS.
- Never hardcode colors, radii, spacing, shadows, blurs, durations, easings, or z-indexes — in a class *or* an inline style. Import from `lib/design/tokens.ts`.
- Inline `style` is for dynamic values (computed transforms, drag positions, progress) and token-fed static values only.
- New visual constants go into the tokens module, not into the first component that needs them.

## Language and spelling

- **US English** for copy, comments, docs, and every new identifier, and say so here.
- Exception: mirroring something external you don't own (npm package names, third-party API surfaces, values a provider sends). Copy verbatim.
- Don't rename an existing identifier, DB column, or enum value for spelling alone when other code or migrations depend on it.

## Database-driven, not hardcoded

- Anything staff might change — projects, models, statuses, sheets, items, options, prices, vendors, trades — comes from the database, not a TypeScript array.
- A new option is a row (or a column), not a code change.
- Price math (option prices, dependent prices, running totals, invoices) has exactly one module, called by both client and server. Never duplicate it.

## Sensitive data

- Never serialize provider credentials, endpoint/webhook URLs, storage paths/buckets, or provider job IDs to the browser.
- Vendor responses must never include prices, invoices, or a buyer's other choices. Strip them in the service, not the component.
- Unsure about a column? Treat it as server-only until proven otherwise.

## Pagination

One pattern for every list.

- **Data layer**: accept `{ cursor?, limit? }`, clamp with `capLimit`, apply the shared `(created_at DESC, id DESC)` cursor predicate, return `Page<T>` (`{ items, nextCursor }`). Primitives live in one `_pagination.ts` re-exported from the barrel.
- **UI**: every list uses one `usePaginatedList` hook with a 1px sentinel div at the bottom of the scroll container. Never fetch a full list up front. The first page may be server-prefetched and passed as `initialPage`.
- **Cursor, not offset** — offsets break under realtime inserts.
- Exceptions (small curated registries, bounded per-parent child sets, external APIs that only offer offsets) are registered in **one allowlist file with a reason each**, enforced by a `check:list-pagination` script. Never assert an exception only in a code comment.
- That check gates *shape*, not *semantics*. Watch the **ASC trap**: on an ASC query `.limit(n)` keeps the *oldest* n and silently drops the newest. Truncation never throws; the symptom is missing rows.
- Adding a list: cursor-paginated data function → `usePaginatedList` in the consumer → sentinel div.

## Validation

Every service function that accepts user input calls `parseOrThrow(Schema, raw)` as its **first line**. Schemas live in `lib/validation/<domain>.ts`. UUID params, enums, string/array lengths, and slug formats belong in the schema, not the function body.

## Rate limiting

- Every service doing meaningful work (email sends, one-time-code sign-in requests, payments, storage I/O, signed URLs, DB mutations) calls `await enforceRateLimit('<name>', ctx.userId)` once near the top. Pre-login calls (one-time-code requests) key on the email and IP instead.
- All limits live in one `SPECS` map; the limiter-name union derives from it so typos are compile errors.
- Never construct a limiter or open a Redis client outside the rate-limit module. `RateLimitError` → 429 + `Retry-After` via the mapper; routes don't handle it.
- Webhooks/crons are gated by signature or cron secret instead.
- Fail-open: if the store is unreachable, proceed and log a warning. It's an abuse/cost guardrail, not an authorization boundary — RLS and the role checks are.

## Adding something new

- **A page**: route file, fetch on the server, pass props down, use the existing shell and primitives.
- **An API endpoint**: thin route → service → mapper. Logic in the service, queries in the data layer, both exported through their barrels.
- **A catalog entry (project, model, status, sheet, item, option)**: insert a row. No TypeScript change for the UI.
- **A new layer concept** (error class, client, provider): extend the existing module; don't create a parallel one.

## Hard nos

- No `middleware.ts` (or whatever the project deliberately replaced it with).
- No new packages without asking.
- No edits to `.env.local`. No secrets in the repo.
- No `console.log` in merged code; `console.error` for genuine errors only.
- No backwards-compatibility shims for code you replace in the same change.
- No SQL for the user to paste into the Supabase dashboard SQL editor. No schema changes made in the dashboard. Every database change goes through the Supabase CLI (see "Database changes").

## When the rules and the code disagree

The rules are the default. If existing code violates a rule, don't pattern-match on it for new code. If you believe a rule itself is wrong, outdated, or could be done significantly better, **stop and flag it before proceeding** — don't silently work around it. Rules can change for a good reason.
