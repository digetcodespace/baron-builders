export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ink";

/**
 * Baron buttons are not rounded rectangles. Their silhouette is the logo's
 * ground slab: a parallelogram leaning right. `--btn-slant` sets the lean.
 */
export const SLAB_SHAPE = "[clip-path:polygon(var(--btn-slant)_0,100%_0,calc(100%-var(--btn-slant))_100%,0_100%)]";

/**
 * `edge` is the 1px outline color (the button itself); `face` fills the inside.
 * Borderless variants have no `edge` and the face fills the whole shape.
 * Color is the only thing that changes on hover: no lift, no glow, no jump.
 */
export const VARIANT_STYLES: Record<ButtonVariant, { edge: string; face: string; text: string; bordered: boolean }> = {
  primary: {
    edge: "bg-transparent",
    face: "bg-primary group-hover/btn:bg-primary-hover group-active/btn:bg-primary-deep",
    text: "text-on-primary",
    bordered: false,
  },
  ink: {
    edge: "bg-transparent",
    face: "bg-ink group-hover/btn:bg-n-700 group-active/btn:bg-n-800",
    text: "text-on-primary",
    bordered: false,
  },
  secondary: {
    edge: "bg-border group-hover/btn:bg-n-300",
    face: "bg-surface group-hover/btn:bg-n-50 group-active/btn:bg-n-100",
    text: "text-text",
    bordered: true,
  },
  ghost: {
    edge: "bg-transparent",
    face: "bg-transparent group-hover/btn:bg-ink-soft group-active/btn:bg-n-100",
    text: "text-text",
    bordered: false,
  },
  danger: {
    edge: "bg-primary-line group-hover/btn:bg-bad",
    face: "bg-bad-bg group-hover/btn:bg-bad group-active/btn:bg-primary-hover",
    text: "text-bad hover:text-on-primary",
    bordered: true,
  },
};

/** Shared by every button: slab silhouette, color-only hover, a barely-there press. */
export const SURFACE = `group/btn relative isolate inline-flex select-none items-center justify-center whitespace-nowrap outline-none transition-[transform,color,background-color] duration-[var(--dur-base)] ease-[var(--ease-out)] active:scale-[.985] active:duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-50 ${SLAB_SHAPE}`;

/** The filled inside of a button. It also draws the keyboard-focus ring, since an outline would be clipped by the shape. */
export function Face({ bordered, className }: { bordered: boolean; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute -z-10 transition-[background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-out)] group-focus-visible/btn:shadow-[var(--focus-inset)] ${SLAB_SHAPE} ${bordered ? "inset-px" : "inset-0"} ${className}`}
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
