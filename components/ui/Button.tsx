"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { BusyStripes, SURFACE, Spot, VARIANT_STYLES, trackPointer, type ButtonVariant } from "./_buttonStyle";
import { Icon, type IconName } from "./Icon";
import { Spinner } from "./Spinner";

export type { ButtonVariant } from "./_buttonStyle";
export type ButtonSize = "sm" | "md" | "lg";

/** `--btn-slant` is how far the slab leans; padding grows with it so labels stay optically centered. */
const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3.5 [--r-btn:11px] text-[length:var(--fs-small)] font-semibold",
  md: "h-10 gap-2 px-5 [--r-btn:14px] t-ui",
  lg: "h-12 gap-2.5 px-7 [--r-btn:17px] text-[length:var(--fs-body)] font-semibold",
};

/** Cancels the flex gap when the leading slot is empty, so a button never shifts when loading starts. */
const GAP_PULL: Record<ButtonSize, string> = { sm: "-mr-1.5", md: "-mr-2", lg: "-mr-2.5" };

function classes(variant: ButtonVariant, size: ButtonSize, extra: string) {
  return `${SURFACE} ${VARIANT_STYLES[variant].base} ${SIZES[size]} ${extra}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  fullWidth?: boolean;
}

/**
 * Text button with a soft squircle shape. Hover shifts color and lets a quiet
 * glow follow the pointer, so nothing jumps. Gets no tooltip when its label explains the action;
 * wrap it in `<Tooltip>` only to explain a non-obvious consequence, and always
 * when it is conditionally disabled, to say why.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconSize = size === "sm" ? 16 : 18;
  const spot = VARIANT_STYLES[variant].spot;
  const hasLead = loading || Boolean(leftIcon);

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes(variant, size, `${fullWidth ? "w-full" : ""} ${className}`)}
      onPointerMove={trackPointer}
      {...rest}
    >
      <Spot color={spot} />
      {loading ? <BusyStripes /> : null}
      <span
        aria-hidden="true"
        style={{ width: hasLead ? iconSize : 0 }}
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden transition-[width,margin,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] ${hasLead ? "opacity-100" : `opacity-0 ${GAP_PULL[size]}`}`}
      >
        {loading ? <Spinner size="sm" /> : leftIcon ? <Icon name={leftIcon} size={iconSize} /> : null}
      </span>
      <span>{children}</span>
      {rightIcon && !loading ? (
        <Icon
          name={rightIcon}
          size={iconSize}
          className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover/btn:translate-x-0.5"
        />
      ) : null}
    </button>
  );
}

export interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: ReactNode;
}

/** A navigation link that looks and moves exactly like a Button. */
export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  const iconSize = size === "sm" ? 16 : 18;
  const spot = VARIANT_STYLES[variant].spot;
  return (
    <Link href={href} className={classes(variant, size, className)} onPointerMove={trackPointer} {...rest}>
      <Spot color={spot} />
      {leftIcon ? <Icon name={leftIcon} size={iconSize} /> : null}
      <span>{children}</span>
      {rightIcon ? (
        <Icon
          name={rightIcon}
          size={iconSize}
          className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover/btn:translate-x-0.5"
        />
      ) : null}
    </Link>
  );
}
