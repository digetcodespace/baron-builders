import type { ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * The only tooltip primitive. Never use a native `title` for a UI affordance
 * (slow, OS-styled, invisible to keyboard focus). Shows on hover and on focus.
 */
export function Tooltip({ content, children, className = "" }: TooltipProps) {
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-[var(--z-tooltip)] mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 t-small text-on-primary! opacity-0 shadow-low transition-opacity duration-[var(--dur-fast)] group-focus-within/tip:opacity-100 group-hover/tip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
