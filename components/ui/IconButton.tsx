import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title" | "aria-label" | "content"> {
  /** Required: the accessible name, and the default tooltip text. */
  label: string;
  icon: ReactNode;
  /** Override the tooltip text (defaults to `label`). */
  content?: ReactNode;
  /** Suppress only when an adjacent visible label makes the tooltip redundant. */
  showTooltip?: boolean;
}

/** Icon-only button. Carries a branded tooltip by default; never re-wrap it in `<Tooltip>`. */
export function IconButton({
  label,
  icon,
  content,
  showTooltip = true,
  className = "",
  type = "button",
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-text transition-colors duration-[var(--dur-fast)] hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
  return showTooltip ? <Tooltip content={content ?? label}>{button}</Tooltip> : button;
}
