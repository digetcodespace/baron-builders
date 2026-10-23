/**
 * Design tokens for TypeScript consumers (inline `style`, charts, email).
 * Values are references to the CSS variables in `brand/tokens.css`, which is the
 * single source of truth. Never hardcode a color, radius, space, or font elsewhere.
 */

export const color = {
  primary: "var(--primary)",
  primaryHover: "var(--primary-hover)",
  onPrimary: "var(--on-primary)",
  ink: "var(--baron-ink)",
  bg: "var(--bg)",
  surface: "var(--surface)",
  border: "var(--border)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  ok: "var(--ok)",
  okBg: "var(--ok-bg)",
  warn: "var(--warn)",
  warnBg: "var(--warn-bg)",
  info: "var(--info)",
  infoBg: "var(--info-bg)",
  bad: "var(--bad)",
  badBg: "var(--bad-bg)",
  primarySoft: "var(--primary-soft)",
  primaryLine: "var(--primary-line)",
  inkSoft: "var(--ink-soft)",
  scrim: "var(--scrim)",
  glass: "var(--glass)",
} as const;

export const font = {
  display: "var(--font-display)",
  ui: "var(--font-ui)",
  mono: "var(--font-mono)",
} as const;

export const radius = {
  sm: "var(--r-sm)",
  md: "var(--r-md)",
  lg: "var(--r-lg)",
} as const;

export const shadow = {
  low: "var(--shadow-1)",
  high: "var(--shadow-2)",
  overlay: "var(--shadow-3)",
  button: "var(--shadow-btn)",
  inset: "var(--shadow-inset)",
} as const;

export const motion = {
  fast: "var(--dur-fast)",
  base: "var(--dur-base)",
  slow: "var(--dur-slow)",
  easeOut: "var(--ease-out)",
  spring: "var(--ease-spring)",
  inOut: "var(--ease-in-out)",
} as const;

export const zIndex = {
  sticky: "var(--z-sticky)",
  tooltip: "var(--z-tooltip)",
  banner: "var(--z-banner)",
  toast: "var(--z-toast)",
  overlay: "var(--z-overlay)",
  popover: "var(--z-popover)",
} as const;

export const focusRing = "var(--focus-ring)";

export const space = {
  1: "var(--s-1)",
  2: "var(--s-2)",
  3: "var(--s-3)",
  4: "var(--s-4)",
  5: "var(--s-5)",
  6: "var(--s-6)",
  7: "var(--s-7)",
  8: "var(--s-8)",
} as const;
