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

/**
 * Email clients cannot read CSS variables, so email templates need literal
 * colors. These mirror brand/tokens.css; change them together.
 */
export const emailTheme = {
  ink: "#101114",
  muted: "#615f5a",
  primary: "#c41e2a",
  onPrimary: "#ffffff",
} as const;

/**
 * The 25 swatches offered wherever a person picks a color for something they name (a stage, a
 * tag). Literal hex on purpose: the chosen value is saved as data and must read the same in every
 * theme, email, and export. Any other color can still be picked freely.
 */
export const swatchColors = [
  { name: "Baron red", hex: "#c41e2a" },
  { name: "Coral", hex: "#e5484d" },
  { name: "Orange", hex: "#f76b3c" },
  { name: "Amber", hex: "#f5a524" },
  { name: "Gold", hex: "#e8c547" },
  { name: "Lime", hex: "#9bbf3b" },
  { name: "Green", hex: "#4caf50" },
  { name: "Emerald", hex: "#1f8a5b" },
  { name: "Teal", hex: "#14a39a" },
  { name: "Cyan", hex: "#0ea5c6" },
  { name: "Sky", hex: "#3b82f6" },
  { name: "Blue", hex: "#2b6cb0" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Violet", hex: "#7c5cd6" },
  { name: "Purple", hex: "#a855c7" },
  { name: "Magenta", hex: "#d946a8" },
  { name: "Pink", hex: "#ec6a95" },
  { name: "Rose", hex: "#b4546a" },
  { name: "Brown", hex: "#8b5e3c" },
  { name: "Tan", hex: "#c08a5b" },
  { name: "Ink", hex: "#25262a" },
  { name: "Slate", hex: "#615f5a" },
  { name: "Stone", hex: "#86837c" },
  { name: "Steel", hex: "#5b7c99" },
  { name: "Forest", hex: "#3d5a4c" },
] as const;

export type SwatchColor = (typeof swatchColors)[number];
