import type { ReactNode } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { Icon, type IconName } from "./Icon";

export interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: IconName;
  /** Change vs. the last period, e.g. +12 means up 12. */
  delta?: { value: number; label: string; /** Whether an increase is good news. */ goodWhenUp?: boolean };
  footer?: ReactNode;
  className?: string;
}

/** One headline number. The digits roll up when it appears. */
export function StatCard({ label, value, prefix, suffix, decimals, icon, delta, footer, className = "" }: StatCardProps) {
  const up = (delta?.value ?? 0) >= 0;
  const good = delta ? (delta.goodWhenUp ?? true) === up : true;
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-low ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-primary" />
      <div className="flex items-start justify-between">
        <p className="t-label text-n-600">{label}</p>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-[length:var(--fs-h1)] font-extrabold leading-none tracking-tight">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </p>
      {delta ? (
        <p className={`mt-2 flex items-center gap-1 t-small font-medium ${good ? "text-ok!" : "text-bad!"}`}>
          <Icon name={up ? "arrow-up-right" : "arrow-right"} size={14} className={up ? "" : "rotate-45"} />
          {Math.abs(delta.value)} <span className="font-normal text-muted">{delta.label}</span>
        </p>
      ) : null}
      {footer ? <div className="mt-3 border-t border-border pt-3">{footer}</div> : null}
    </div>
  );
}
