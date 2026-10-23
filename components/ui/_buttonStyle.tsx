import type { PointerEvent } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ink";

/**
 * Per-variant look. `spot` is the soft glow that follows the pointer across the
 * button on hover: quiet enough not to stand out on the page, distinctive
 * enough that a Baron button never feels like a template.
 */
export const VARIANT_STYLES: Record<ButtonVariant, { base: string; spot: string }> = {
  primary: {
    base: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-deep",
    spot: "var(--spot-light)",
  },
  ink: {
    base: "bg-ink text-on-primary hover:bg-n-800 active:bg-n-700",
    spot: "var(--spot-light)",
  },
  secondary: {
    base: "border border-border bg-surface text-text hover:border-n-300 hover:bg-n-50 active:bg-n-100",
    spot: "var(--spot-brand)",
  },
  ghost: {
    base: "bg-transparent text-text hover:bg-ink-soft active:bg-n-100",
    spot: "var(--spot-dark)",
  },
  danger: {
    base: "border border-primary-line bg-bad-bg text-bad hover:border-bad hover:bg-bad hover:text-on-primary active:bg-primary-hover",
    spot: "var(--spot-light)",
  },
};

/**
 * Shared by every button. The corner is a soft "squircle" (a superellipse, in
 * browsers that support `corner-shape`; a plain large radius elsewhere) with a
 * radius of 14px instead of the usual 6-8px. Hover shifts color only, and the
 * press is a barely-there settle. `translate` and `scale` are listed because
 * Tailwind 4 animates them as their own properties, not as `transform`.
 */
export const SURFACE =
  "group/btn relative isolate inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap rounded-[var(--r-btn)] [corner-shape:squircle] transition-[background-color,border-color,color,translate,scale] duration-[var(--dur-base)] ease-[var(--ease-smooth)] active:scale-[.985] active:duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-50";

/** Point the glow at the cursor. Writes CSS variables directly, so moving the mouse never re-renders React. */
export function trackPointer(event: PointerEvent<HTMLElement>) {
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
}

/** The glow itself: invisible at rest, eases in under the pointer on hover. */
export function Spot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-smooth)] group-hover/btn:opacity-100"
      style={{ background: `radial-gradient(7.5rem circle at var(--mx, 50%) var(--my, 50%), ${color}, transparent 72%)` }}
    />
  );
}

/** Moving stripes while a button is busy, so loading reads as progress, not a freeze. */
export function BusyStripes() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-[5] animate-stripes opacity-[.14] [background-image:repeating-linear-gradient(115deg,transparent_0_8px,currentColor_8px_14px)] [background-size:28px_100%]"
    />
  );
}
