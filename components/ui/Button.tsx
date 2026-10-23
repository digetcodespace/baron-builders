import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ink";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary shadow-[var(--shadow-btn)] hover:bg-primary-hover hover:shadow-[var(--shadow-btn-hover)]",
  ink: "bg-ink text-on-primary shadow-[var(--shadow-ink)] hover:bg-n-800",
  secondary:
    "border border-border bg-surface text-text shadow-low hover:border-n-300 hover:bg-n-50",
  ghost: "bg-transparent text-text hover:bg-ink-soft",
  danger:
    "bg-bad-bg text-bad border border-primary-line hover:bg-bad hover:text-on-primary hover:border-bad",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[length:var(--fs-small)] font-semibold",
  md: "h-10 gap-2 px-4 t-ui",
  lg: "h-12 gap-2.5 px-6 text-[length:var(--fs-body)] font-semibold",
};

const SHEEN = new Set<ButtonVariant>(["primary", "ink"]);

/** Cancels the flex gap when the leading slot is empty, so a button never shifts when loading starts. */
const GAP_PULL: Record<ButtonSize, string> = { sm: "-mr-1.5", md: "-mr-2", lg: "-mr-2.5" };

export function buttonClasses(variant: ButtonVariant, size: ButtonSize, extra = "") {
  return `group/btn relative inline-flex select-none items-center justify-center overflow-hidden rounded-md whitespace-nowrap transition-[background-color,box-shadow,transform,border-color,color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-px active:translate-y-0 active:scale-[.98] active:duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

function Sheen({ variant }: { variant: ButtonVariant }) {
  if (!SHEEN.has(variant)) return null;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-[120%] [background:var(--sheen)] group-hover/btn:animate-sheen"
    />
  );
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
 * Text button. Gets no tooltip when its label explains the action; wrap it in
 * `<Tooltip>` only to explain a non-obvious consequence, and always when it is
 * conditionally disabled, to say why.
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
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, `${fullWidth ? "w-full" : ""} ${className}`)}
      {...rest}
    >
      <Sheen variant={variant} />
      <span
        aria-hidden="true"
        style={{ width: loading || leftIcon ? iconSize : 0 }}
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden transition-[width,margin,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] ${loading || leftIcon ? "opacity-100" : `opacity-0 ${GAP_PULL[size]}`}`}
      >
        {loading ? <Spinner size="sm" /> : leftIcon ? <Icon name={leftIcon} size={iconSize} /> : null}
      </span>
      <span className="relative">{children}</span>
      {rightIcon && !loading ? (
        <Icon
          name={rightIcon}
          size={iconSize}
          className="relative transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] group-hover/btn:translate-x-0.5"
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

/** A navigation link that looks like a Button. */
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
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      <Sheen variant={variant} />
      {leftIcon ? <Icon name={leftIcon} size={iconSize} /> : null}
      <span className="relative">{children}</span>
      {rightIcon ? (
        <Icon
          name={rightIcon}
          size={iconSize}
          className="relative transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] group-hover/btn:translate-x-0.5"
        />
      ) : null}
    </Link>
  );
}
