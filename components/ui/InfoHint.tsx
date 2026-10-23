import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

/** Explains a field or label (never a button): a small "i" that reveals the text on hover or focus. */
export function InfoHint({ children, label = "More information" }: { children: ReactNode; label?: string }) {
  return (
    <Tooltip content={children}>
      <span
        tabIndex={0}
        role="img"
        aria-label={label}
        className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full text-n-500 transition-colors hover:text-primary focus-visible:text-primary"
      >
        <Icon name="info" size={16} />
      </span>
    </Tooltip>
  );
}
