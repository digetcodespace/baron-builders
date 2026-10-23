import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface text-text border border-border hover:bg-bg",
  ghost: "bg-transparent text-text hover:bg-bg",
  danger: "bg-bad text-on-primary hover:bg-primary-hover",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 t-ui",
  md: "h-10 px-4 t-ui",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
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
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-md transition-colors duration-[var(--dur-fast)] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
