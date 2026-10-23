import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface TagProps {
  children: ReactNode;
  /** Shows a remove button when given. */
  onRemove?: () => void;
  tone?: "neutral" | "brand";
  className?: string;
}

/** Small label for a trade, model, or filter. Removable when it represents an active filter. */
export function Tag({ children, onRemove, tone = "neutral", className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex animate-pop-in items-center gap-1 rounded-md py-1 pl-2.5 t-small font-medium ${onRemove ? "pr-1" : "pr-2.5"} ${tone === "brand" ? "bg-primary-soft text-primary-hover!" : "bg-ink-soft text-n-700!"} ${className}`}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="flex h-5 w-5 items-center justify-center rounded-sm transition-colors hover:bg-ink-soft"
        >
          <Icon name="x" size={12} strokeWidth={2.5} />
        </button>
      ) : null}
    </span>
  );
}
