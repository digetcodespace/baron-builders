import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Tooltip } from "./Tooltip";

type Variant = "ghost" | "secondary" | "primary" | "ink";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  ghost: "text-text hover:bg-ink-soft",
  secondary: "border border-border bg-surface text-text shadow-low hover:border-n-300 hover:bg-n-50",
  primary: "bg-primary text-on-primary shadow-[var(--shadow-btn)] hover:bg-primary-hover",
  ink: "bg-ink text-on-primary shadow-[var(--shadow-ink)] hover:bg-n-800",
};
const SIZES: Record<Size, { box: string; icon: number }> = {
  sm: { box: "h-8 w-8", icon: 16 },
  md: { box: "h-10 w-10", icon: 20 },
  lg: { box: "h-12 w-12", icon: 22 },
};

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title" | "aria-label" | "content"> {
  /** Required: the accessible name, and the default tooltip text. */
  label: string;
  icon: IconName;
  variant?: Variant;
  size?: Size;
  /** Override the tooltip text (defaults to `label`). */
  content?: ReactNode;
  /** Suppress only when an adjacent visible label makes the tooltip redundant. */
  showTooltip?: boolean;
}

/** Icon-only button. Carries a branded tooltip by default; never re-wrap it in `<Tooltip>`. */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
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
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-md transition-[background-color,box-shadow,transform,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-px active:translate-y-0 active:scale-95 active:duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size].box} ${className}`}
      {...rest}
    >
      <Icon name={icon} size={SIZES[size].icon} />
    </button>
  );
  return showTooltip ? <Tooltip content={content ?? label}>{button}</Tooltip> : button;
}
