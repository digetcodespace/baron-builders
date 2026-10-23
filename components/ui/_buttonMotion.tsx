"use client";

import { useRef, useState, type PointerEvent } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ink";

/**
 * Per-variant look. `wipe` is the slanted slab that sweeps across on hover;
 * `hoverText` recolors the label as the slab passes under it.
 */
export const VARIANT_STYLES: Record<ButtonVariant, { base: string; wipe: string; ripple: "light" | "dark" }> = {
  primary: {
    base: "bg-primary text-on-primary shadow-[var(--shadow-btn)] hover:shadow-[var(--shadow-btn-hover)]",
    wipe: "bg-primary-hover",
    ripple: "light",
  },
  ink: {
    base: "bg-ink text-on-primary shadow-[var(--shadow-ink)]",
    wipe: "bg-primary",
    ripple: "light",
  },
  secondary: {
    base: "border border-border bg-surface text-text shadow-low hover:border-n-300",
    wipe: "bg-n-100",
    ripple: "dark",
  },
  ghost: {
    base: "bg-transparent text-text",
    wipe: "bg-ink-soft",
    ripple: "dark",
  },
  danger: {
    base: "border border-primary-line bg-bad-bg text-bad hover:border-bad hover:text-on-primary",
    wipe: "bg-bad",
    ripple: "light",
  },
};

/** Shared by every button: spring lift, press-down, and the clipping the slab and ripple need. */
export const SURFACE =
  "btn-surface group/btn relative isolate inline-flex select-none items-center justify-center overflow-hidden rounded-md whitespace-nowrap hover:-translate-y-px active:translate-y-0 active:scale-[.97] disabled:pointer-events-none disabled:opacity-50";

/**
 * The slanted slab. At rest it is collapsed against the right edge; on hover it
 * grows from the left, and when the pointer leaves it exits out the right. The
 * slant matches the logo's ground slab.
 */
export function Wipe({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 -left-[14%] -z-10 w-[128%] origin-right -skew-x-[18deg] scale-x-0 transition-transform duration-[460ms] ease-[var(--ease-out)] group-hover/btn:origin-left group-hover/btn:scale-x-100 ${className}`}
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

/** A soft circle that spreads from exactly where you pressed. */
export function useRipple(tone: "light" | "dark") {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const nextId = useRef(0);

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const box = event.currentTarget.getBoundingClientRect();
    const size = Math.max(box.width, box.height) * 2.4;
    setRipples((current) => [
      ...current.slice(-3),
      { id: nextId.current++, x: event.clientX - box.left, y: event.clientY - box.top, size },
    ]);
  };

  const layer = (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[4] overflow-hidden rounded-[inherit]">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          onAnimationEnd={() => setRipples((current) => current.filter((r) => r.id !== ripple.id))}
          className="absolute animate-ripple rounded-full"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            background: tone === "light" ? "var(--ripple-light)" : "var(--ripple-dark)",
          }}
        />
      ))}
    </span>
  );

  return { onPointerDown, layer };
}
