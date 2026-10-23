"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { SURFACE, Spot, VARIANT_STYLES, trackPointer } from "./_buttonStyle";
import { Icon, type IconName } from "./Icon";
import { Tooltip } from "./Tooltip";

type Variant = "ghost" | "secondary" | "primary" | "ink";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { box: string; icon: number }> = {
  sm: { box: "h-8 w-8 [--r-btn:11px]", icon: 16 },
  md: { box: "h-10 w-10 [--r-btn:14px]", icon: 20 },
  lg: { box: "h-12 w-12 [--r-btn:17px]", icon: 22 },
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

/** Icon-only button in the same squircle shape as Button. Carries a branded tooltip by default; never re-wrap it in `<Tooltip>`. */
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
  const v = VARIANT_STYLES[variant];
  const button = (
    <button
      type={type}
      aria-label={label}
      className={`${SURFACE} ${v.base} ${SIZES[size].box} ${className}`}
      onPointerMove={trackPointer}
      {...rest}
    >
      <Spot color={v.spot} />
      <Icon name={icon} size={SIZES[size].icon} />
    </button>
  );
  return showTooltip ? <Tooltip content={content ?? label}>{button}</Tooltip> : button;
}
