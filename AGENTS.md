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

**Design language.** Buttons have soft squircle corners (`components/ui/_buttonStyle.tsx`: a 14px radius with `corner-shape: squircle` where supported), a color-only hover, and a faint glow that follows the pointer; nothing lifts, jumps, or casts a shadow. Keyboard focus is the global outline. Every field shares one frame (`components/ui/_FieldFrame.tsx`): on focus the border color fades in all the way around, a soft halo follows, and a red line draws left to right along the whole bottom edge, leaving to the right on blur. Labeled controls use `FieldShell`, which adds the floating label, leading and trailing slots, and the hint or error row. Field motion uses the soft `--ease-smooth` and `--ease-draw` curves; everything else uses `--ease-out`. All motion comes from the keyframes and easing tokens in `app/globals.css` and `brand/tokens.css`, and respects reduced-motion.

**House rules for the look.** No colored edge stripes on cards, banners, rows, or sidebar items (a thick colored line down one side reads as generic): tone shows in an icon tile, a soft wash, or a tinted chip instead. No heavy drop shadows on selectable cards: choices are cells in one connected strip with hairline dividers and a sliding frame (`OptionCardGroup`). Status uses the window-plate `StatusPill`, trades and models use the monogram `Tag`, people use the squircle `Avatar`. Tooltips render in a portal above everything (`z-tooltip`), so nothing can clip them.

**Tailwind 4 trap.** `translate-*`, `scale-*`, and `rotate-*` set the standalone CSS properties `translate`, `scale`, and `rotate`, not `transform`. A `transition-[transform,...]` list therefore does NOT animate them (the element jumps). Always list `transform,translate,scale,rotate`, or use the plain `transition-transform` utility.

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

## Sign-in and invites: what is configured, and what is still needed

Built and verified end to end (`npm run test:e2e:auth`, 28 checks against the live project): the sign-in page, emailed one-time codes, sign-out, role-in-token redirects, the People page, and invitations for staff, buyers (tied to a house), and vendors (tied to a company).

| Setting | Where | Status |
| --- | --- | --- |
| Public sign-up off, site URL, redirect URLs | `supabase/config.toml`, pushed with `npx supabase config push` | Done |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` | Vercel (Production) | Done |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel and local `.env.local` | **Needed for invites.** Sign-in does not need it |
| `RESEND_API_KEY`, `EMAIL_FROM` (a verified sending address) | Vercel and local `.env.local` | **Needed to email invitations.** Without them an invite shows a sign-in link to share |
| Custom SMTP (Resend) plus the branded code email | `[auth.smtp]` and `[auth.email.template.magic_link]` in `config.toml` | **Needed before codes can reach real inboxes.** Supabase's built-in mailer sends only the default link email, only to team members, and allows 2 emails an hour. The template is ready in `supabase/templates/magic_link.html`; Supabase refuses a custom template until SMTP is configured |
| First staff account | `npm run create-staff -- you@company.com "Your Name"` | Run once |

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
