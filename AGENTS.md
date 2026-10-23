# AGENTS.md

All structural rules for this repo live in [CLAUDE.md](CLAUDE.md). Read it first and follow it exactly; it is the single source of truth. Do not duplicate or restate its rules here.

This file is for the current implementation only (stack, commands, folder map, env setup).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS v4; request interception is `proxy.ts`, never `middleware.ts`
- Supabase: Postgres, row-level security, one-time-code sign-in, realtime (`@supabase/supabase-js`, `@supabase/ssr`)
- Resend for email
- Payments: Sola Payments is the likely provider (not decided; the proposal says Stripe). It sits behind `PaymentProvider` in `lib/providers/payments`, so choosing one is a single new implementation.
- Zod for validation (`parseOrThrow`)

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run check` | All structural checks (see below) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run check:ci` | Everything CI runs, in order |

## Structural checks (`scripts/checks/`)

Each rule in CLAUDE.md that a script can enforce has one. A new exception goes in the allowlist file with a reason, never only in a code comment.

| Script | Enforces |
| --- | --- |
| `layering` | Imports go down; barrels only; underscore modules are private; components, hooks, and pages never touch the data layer |
| `forbidden` | No `middleware.ts`, `console.log`, hardcoded colors, `process.env` outside `lib/config`, `animate-pulse`, native `title` on buttons, swallowed errors in services |
| `routes` | Every API route catches through `toErrorResponse(err, req)`; every page has a `loading.tsx` and `error.tsx` above it |
| `service-role` | The RLS-bypassing client is used only by files in `allowlist-service-role.txt` |
| `list-pagination` | Every `lib/data` `list*` returns `Page<T>` unless in `allowlist-list-pagination.txt` |
| `spelling` | US English |

## Component library

Every control is custom and lives in `components/ui/` (one file each, exported from `components/ui/index.ts`). The live reference is the gallery at **/design** (`components/dev/`): every component, every state, interactive. Open it before building a screen, and add any new component to it. It is visible during build-out; restrict or remove it before launch.

| Group | Components |
| --- | --- |
| Actions | Button, LinkButton, IconButton |
| Inputs | TextField, TextArea, SelectField (searchable), SearchField, CurrencyField, NumberStepper, DateField + Calendar, Checkbox, RadioGroup, Switch, SegmentedControl, OptionCardGroup, OtpField, FileDropzone |
| Feedback | Toast (providers), Banner, Tooltip, InfoHint, StatusPill, ProgressBar, Skeleton, Spinner, BrandLoader, EmptyState, AnimatedNumber, Money |
| Overlays | Modal, ConfirmDialog, Drawer, Popover, Menu |
| Navigation | Tabs, Breadcrumbs, Stepper, Accordion; layout: Sidebar, TopBar, MobileTabBar, AppShell |
| Data display | Card, StatCard, DataTable, Avatar, Tag, Timeline, DescriptionList, Divider |
| Foundations | Icon (49 icons in one file), BrandLogo, tokens (`brand/tokens.css`), motion (`app/globals.css`) |

**Design language.** One field frame for every labeled input: a floating label, a focus ring, and the "slab", a slanted red bar that draws under the field on focus (the logo's ground slab). Buttons lift on hover, settle on press, and primary buttons catch a sheen. Selected states use brand red with a soft tint. All motion comes from the keyframes and easing tokens in `app/globals.css` and `brand/tokens.css`, and respects reduced-motion.

**Smoothness rules.** Animate `transform` and `opacity` only (never `top`, `left`, or `height`; collapse with the grid-rows trick). Shadows that transition must have the same shape on both ends (see the `--shadow-field-*` tokens). Base behavior (hand cursor on everything clickable, keyboard focus outline, thin scrollbars, smooth anchor scroll) lives in `@layer base` in `app/globals.css`, so any component utility can override it; never add unlayered global rules, because they beat every utility. Fonts load through `next/font` in `app/layout.tsx`. Every page eases in through `app/template.tsx`.

**Rules for new components.** Colors, radii, shadows, durations, and z-indexes come from tokens only. Labeled inputs use `FieldShell` (never hand-roll a label and input). Overlays use `Portal`, `usePresence`, and the focus and scroll hooks in `components/ui/_hooks.ts`. Icon-only buttons are `IconButton` (tooltip built in). Never add a second toast, modal, or tooltip.

## Folder map

```
app/                       HTTP layer only: routes and pages. No logic, no database.
  (auth)/sign-in/          Sign-in (one page for all three roles)
  (staff)|(buyer)|(vendor)/ The three portals; each layout calls requirePortalRole()
  api/                     Thin route handlers: context -> service -> toErrorResponse
proxy.ts                   Session refresh + sign-in redirect (calls lib/http)
lib/
  config/                  The only reader of environment variables
  http/                    toErrorResponse, request context, role guards, session refresh
  services/                Business logic. Receives a RequestContext, throws typed errors
    index.ts               The gated barrel (the only public surface)
    _context.ts _errors.ts Private to this folder
  data/                    All Supabase queries. index.ts = server barrel, client.ts = browser barrel
  validation/              Zod schemas + parseOrThrow, one file per domain
  rate-limit/              SPECS map + enforceRateLimit (in-memory store behind an interface)
  providers/               email (Resend), payments (interface only). Registry, no barrel
  api/                     Client side: apiFetch, parseApiError, ApiError
  observability/           logError / logWarn, the single door to the error tracker
  design/tokens.ts         TypeScript view of the brand tokens
components/
  ui/                      Primitives: Button, IconButton, Tooltip, Banner, FieldError, PageHeader, Skeleton, Spinner, StatusPill
  providers/               Toast, payment banner, realtime. The only components allowed to touch lib/data/client
  feedback/                ErrorBoundary, RouteError
  layout/                  PortalShell, PortalLoading
  houses/                  Feature components (HouseList)
hooks/                     usePaginatedList, useApiErrorHandler, useHousesList
supabase/migrations/       SQL, applied in filename order. See DATABASE.md
brand/                     Brand kit. brand/tokens.css is the source of truth for visual constants
public/brand/              Logo and favicon files served by the app
scripts/checks/            The structural checks and their allowlists
```

## Adding a feature (the vertical slice)

`houses` is the worked example. Copy its shape:

1. **Schema:** a migration in `supabase/migrations/`, with RLS in the same file; update `DATABASE.md` and `ACCESS.md`.
2. **Data:** a function in `lib/data/<thing>.ts`, exported from `lib/data/index.ts`. Lists take `{ cursor, limit }` and return `Page<T>`.
3. **Validation:** a schema in `lib/validation/<thing>.ts`.
4. **Service:** `lib/services/<thing>.ts`, first line `parseOrThrow`, then `enforceRateLimit`, then `assert*` access, then the data call, then `recordAudit` for writes. Export from `lib/services/index.ts`.
5. **Route:** `app/api/<thing>/route.ts` (copy `app/api/houses/route.ts`).
6. **UI:** a hook in `hooks/` (use `usePaginatedList` for lists, `useApiErrorHandler` for errors), a component in `components/<thing>/`, a page that prefetches the first page.

## Database migrations

Agents run migrations themselves, through the Supabase CLI. The project is linked to **Baron Builders** (`syxcjsjquxvqqyxtxvme`).

```bash
npx supabase db push --dry-run   # list what would be applied
npx supabase db push             # apply
npm run db:test                  # the stranger test; rolls back, must show 0 failed
```

Auth settings live in `supabase/config.toml`; run `npx supabase config diff` and confirm it shows only your change before `npx supabase config push --yes`.

Never edit an applied migration; add a new one. After any schema or policy change, extend `supabase/tests/stranger.sql` and update DATABASE.md and ACCESS.md.

## Environment

Copy `.env.example` to `.env.local`. Never commit real values and never edit `.env.local` from an agent session. The app boots without Supabase configured (sign-in redirects), but nothing past sign-in works until `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are set.

## Not built yet

- Sign-in (emailed one-time code); the page is a placeholder.
- Sheets, items, selections, invoices, payments, messages (next migration).
- A shared rate-limit store (the in-memory one is per process).
- Automated tests, an error tracker (Sentry), and generated Supabase types. Each needs a decision before adding a package.
