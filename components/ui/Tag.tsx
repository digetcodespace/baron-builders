import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface TagProps {
  /** The tag's text. Its first letter becomes the monogram. */
  children: string;
  /** Shows a remove button when given. */
  onRemove?: () => void;
  tone?: "neutral" | "brand" | "ink";
  /** Replace the letter monogram, e.g. with an icon. */
  mark?: ReactNode;
  className?: string;
}

const MONOGRAM = {
  neutral: "bg-n-700 text-on-primary",
  brand: "bg-primary text-on-primary",
  ink: "bg-ink text-on-primary",
} as const;

/**
 * A label for a trade, model, or filter. A small monogram tile carries the
 * first letter (T for Tile, E for Electric), so a row of tags scans at a glance
 * without turning into a row of colored pills.
 */
export function Tag({ children, onRemove, tone = "neutral", mark, className = "" }: TagProps) {
  return (
    <span
      className={`group/tag inline-flex animate-chip-pop items-center gap-2 rounded-[10px] border border-border bg-surface py-1 pl-1 transition-[border-color,background-color] duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:border-n-300 ${onRemove ? "pr-1" : "pr-3"} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 items-center justify-center rounded-[7px] font-display text-[length:var(--fs-small)] font-extrabold uppercase ${MONOGRAM[tone]}`}
      >
        {mark ?? children.trim().charAt(0)}
      </span>
      <span className="t-ui font-medium text-text">{children}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${children}`}
          className="flex h-6 w-6 items-center justify-center rounded-[7px] text-n-500 transition-[background-color,color,scale] duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:bg-ink-soft hover:text-text active:scale-90"
        >
          <Icon name="x" size={14} strokeWidth={2.4} />
        </button>
      ) : null}
    </span>
  );
}
