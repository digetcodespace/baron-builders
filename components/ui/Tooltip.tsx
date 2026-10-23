import type { ReactNode } from "react";

type Side = "top" | "bottom" | "left" | "right";

const POSITION: Record<Side, { panel: string; arrow: string }> = {
  top: {
    panel: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    arrow: "left-1/2 top-full -translate-x-1/2 -translate-y-1/2",
  },
  bottom: {
    panel: "top-full left-1/2 mt-2 -translate-x-1/2",
    arrow: "left-1/2 bottom-full -translate-x-1/2 translate-y-1/2",
  },
  left: {
    panel: "right-full top-1/2 mr-2 -translate-y-1/2",
    arrow: "top-1/2 left-full -translate-x-1/2 -translate-y-1/2",
  },
  right: {
    panel: "left-full top-1/2 ml-2 -translate-y-1/2",
    arrow: "top-1/2 right-full translate-x-1/2 -translate-y-1/2",
  },
};

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  className?: string;
}

/**
 * The only tooltip primitive. Never use a native `title` for a UI affordance
 * (slow, OS-styled, invisible to keyboard focus). Shows on hover and on focus,
 * after a short delay so it never flickers while the pointer passes over.
 */
export function Tooltip({ content, children, side = "top", className = "" }: TooltipProps) {
  const pos = POSITION[side];
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[var(--z-tooltip)] w-max max-w-64 scale-95 rounded-md bg-ink px-2.5 py-1.5 text-center text-[length:var(--fs-small)] font-medium leading-snug text-on-primary opacity-0 shadow-high transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] group-focus-within/tip:scale-100 group-focus-within/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:opacity-100 group-hover/tip:delay-300 ${pos.panel}`}
      >
        {content}
        <span aria-hidden="true" className={`absolute h-2 w-2 rotate-45 bg-ink ${pos.arrow}`} />
      </span>
    </span>
  );
}
