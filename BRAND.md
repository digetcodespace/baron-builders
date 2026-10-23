# BRAND.md

The Baron Builders brand: logo, favicon, color, type, and loading animation. Brand only. Software components (buttons, tables, nav, dashboards) are designed separately and consume these tokens. They do not live here.

Everything is in [`brand/`](brand/). Open [`brand/brand.html`](brand/brand.html) in a browser to see it all.

## Files

| Path | What it is |
| --- | --- |
| `brand/brand.html` | The brand page: logo, favicon options, color, type specimen |
| `brand/tokens.css` | Source of truth for color, type families, type scale, radii, shadows, spacing, plus the `t-*` type classes |
| `brand/logo/baron-logo.svg` | Horizontal lockup, for light backgrounds |
| `brand/logo/baron-logo-reverse.svg` | Horizontal lockup, for dark backgrounds |
| `brand/logo/baron-mark.svg`, `baron-mark-reverse.svg` | Towers only (no wordmark) |
| `brand/logo/favicon.svg` + `favicon-32/180/512.png` | The chosen favicon (ink tile) |
| `brand/logo/favicon/` | Six favicon directions, kept for reference |
| `brand/web/baron-loader.js` | Drop-in page preloader (the towers build while the page loads) |
| `brand/web/demo.html` | Sample page using the preloader |
| `brand/anim.html` | The full build animation (logo mode and icon mode), for presentations |

## Logo

- Two towers (short on the left, tall on the right) on a slanted ground slab, with small windows. Heavy justified caps: BARON, BUILDERS, then RESIDENTIAL • COMMERCIAL, all one width.
- The lettering is **Montserrat Black/Bold converted to outlines**. It is artwork. Never retype it in a UI font, and never stretch or recolor it outside the two supplied versions (light and reverse).
- The mark is a rebuilt, flat version of the original logo (the old gradients and curl were dropped on purpose). If the client supplies the original font file, the outlines can be regenerated.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `--baron-red-600` | `#C41E2A` | Primary. The only loud color |
| `--baron-red-700` | `#A01721` | Hover / pressed |
| `--baron-red-800` | `#7A0F17` | Deep red (tower shadow side) |
| `--baron-ink` | `#101114` | Text, dark surfaces |
| `--n-50` … `--n-900` | warm neutrals | Backgrounds, borders, muted text |
| `--ok` / `--warn` / `--info` / `--bad` | muted status colors | Status only. Red stays meaningful |

## Type

- **Archivo** (expanded width, 700–900): headlines and big numbers. Echoes the logo's wide caps.
- **Geist** (400–700): all interface text.
- **Geist Mono** (400–600): job IDs, amounts, dates. Use tabular figures so columns align.
- Scale: display 76 / h1 44 / h2 32 / h3 22 / h4 18 / lead 19 / body 16 / UI 15 / small 13 / label 12 (uppercase, +12% tracking). Nothing readable goes below 13px.
- Fonts currently load from Google Fonts via `tokens.css`. Self-host them before launch if the suite must work offline.

## Preloader

Add `<script src="…/baron-loader.js"></script>` as the first, synchronous script in `<head>`. It covers the page, plays the build, then lifts away once the page has loaded. Options are `data-min`, `data-max`, `data-speed`, `data-bg`. API: `BaronLoader.hide()`.

## Using this in the app

- The app's design-tokens module (`lib/design/tokens.ts`, per CLAUDE.md) should mirror the values in `brand/tokens.css`. Do not introduce new brand colors or fonts anywhere else.
- Components are designed and built separately. They take colors, type, radii, and spacing from the tokens and use the logo files as supplied.
