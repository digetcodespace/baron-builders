import type { ReactNode } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { Icon, type IconName } from "./Icon";
import { Sparkline } from "./Sparkline";

export interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: IconName;
  /** Change vs. the last period, e.g. +12 means up 12. */
  delta?: { value: number; label: string; /** Whether an increase is good news. */ goodWhenUp?: boolean };
  /** A short history to draw as a trend line. */
  trend?: number[];
  footer?: ReactNode;
  className?: string;
}

/**
 * One headline number: the label and an icon tile on top, the number large in
 * the display face, and the change and a trend line along the bottom. The tone
 * lives in the delta and the trend line, never in a colored edge.
 */
export function StatCard({ label, value, prefix, suffix, decimals, icon, delta, trend, footer, className = "" }: StatCardProps) {
  const up = (delta?.value ?? 0) >= 0;
  const good = delta ? (delta.goodWhenUp ?? true) === up : true;
  const tone = good ? "var(--ok)" : "var(--bad)";
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="t-ui font-medium text-n-600">{label}</p>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-border bg-n-50 text-n-600 [corner-shape:squircle]">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[length:var(--fs-display)] font-black leading-none tracking-tight">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </p>
      <div className="mt-4 flex items-end justify-between gap-3">
        {delta ? (
          <p className="flex items-center gap-2 t-small">
            <span
              style={{ ["--tone" as string]: tone }}
              className="inline-flex items-center gap-1 rounded-lg bg-[color-mix(in_srgb,var(--tone)_12%,var(--surface))] px-2 py-1 font-semibold text-[var(--tone)]"
            >
              <Icon name={up ? "arrow-up-right" : "arrow-right"} size={13} strokeWidth={2.6} className={up ? "" : "rotate-45"} />
              {Math.abs(delta.value)}
            </span>
            {delta.label}
          </p>
        ) : (
          <span />
        )}
        {trend ? <Sparkline values={trend} color={tone} /> : null}
      </div>
      {footer ? <div className="mt-4 border-t border-border pt-4">{footer}</div> : null}
    </div>
  );
}
