"use client";

import type { ButtonHTMLAttributes, PointerEvent, ReactNode } from "react";
import { SURFACE, Wipe, useRipple } from "./_buttonMotion";
import { Icon, type IconName } from "./Icon";
import { Tooltip } from "./Tooltip";

type Variant = "ghost" | "secondary" | "primary" | "ink";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, { base: string; wipe: string; ripple: "light" | "dark" }> = {
  ghost: { base: "bg-transparent text-text", wipe: "bg-ink-soft", ripple: "dark" },
  secondary: {
    base: "border border-border bg-surface text-text shadow-low hover:border-n-300",
    wipe: "bg-n-100",
    ripple: "dark",
  },
  primary: {
    base: "bg-primary text-on-primary shadow-[var(--shadow-btn)] hover:shadow-[var(--shadow-btn-hover)]",
    wipe: "bg-primary-hover",
    ripple: "light",
  },
  ink: { base: "bg-ink text-on-primary shadow-[var(--shadow-ink)]", wipe: "bg-primary", ripple: "light" },
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
  onPointerDown,
  ...rest
}: IconButtonProps) {
  const style = VARIANTS[variant];
  const ripple = useRipple(style.ripple);
  const button = (
    <button
      type={type}
      aria-label={label}
      className={`${SURFACE} ${style.base} ${SIZES[size].box} ${className}`}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      <Wipe className={style.wipe} />
      {ripple.layer}
      <Icon name={icon} size={SIZES[size].icon} className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] group-hover/btn:scale-110" />
    </button>
  );
  return showTooltip ? <Tooltip content={content ?? label}>{button}</Tooltip> : button;
}
