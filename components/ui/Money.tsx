import { AnimatedNumber } from "./AnimatedNumber";

export interface MoneyProps {
  /** Integer cents. The database stores every price this way. */
  cents: number;
  /** Roll the digits when the value changes (running totals). */
  animated?: boolean;
  /** Hide ".00" on whole-dollar amounts. */
  compact?: boolean;
  className?: string;
}

/** Display a price. Price math lives in one module elsewhere; this only formats cents. */
export function Money({ cents, animated = false, compact = false, className = "" }: MoneyProps) {
  const dollars = cents / 100;
  const whole = cents % 100 === 0;
  const decimals = compact && whole ? 0 : 2;
  if (animated) {
    return (
      <span className={`t-mono ${className}`}>
        <AnimatedNumber value={dollars} decimals={decimals} prefix="$" />
      </span>
    );
  }
  const text = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(dollars);
  return <span className={`t-mono ${className}`}>{text}</span>;
}
