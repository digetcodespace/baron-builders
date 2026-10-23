# AGENTS.md

All structural rules for this repo live in [CLAUDE.md](CLAUDE.md). Read it first and follow it exactly; it is the single source of truth. Do not duplicate or restate its rules here.

This file is for the current implementation only (stack, commands, folder map, env setup).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack

- Next.js (App Router, TypeScript), Tailwind CSS v4
- Supabase: Postgres, row-level security, one-time-code sign-in, realtime (`@supabase/supabase-js`, `@supabase/ssr`)
- Resend for email
- Payments: Sola Payments is the likely provider (not decided; the proposal says Stripe). Keep it behind one service module so the provider can change.
- Zod for validation (`parseOrThrow`)

## Commands

- `npm run dev` — dev server on :3000
- `npm run build` — production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type check

## Folder map

- `app/` — HTTP layer: routes and pages only
- `lib/design/tokens.ts` — TypeScript view of the brand tokens (references the CSS variables)
- `brand/` — logo, favicon, color and type tokens, preloader, brand page. See [BRAND.md](BRAND.md). `brand/tokens.css` is the source of truth for visual constants and is imported by `app/globals.css`.
- `public/brand/` — logo and favicon files served by the app (copies of `brand/logo/`)
- `lib/services/`, `lib/data/`, `components/` — not created yet; add them as the layers fill in (see CLAUDE.md "Layering")
