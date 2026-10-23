export type PillTone = "neutral" | "brand" | "info" | "ok" | "warn" | "bad";

const TONES: Record<PillTone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-n-100 text-n-700", dot: "bg-n-500" },
  brand: { pill: "bg-primary-tint text-primary-hover", dot: "bg-primary" },
  info: { pill: "bg-info-bg text-info", dot: "bg-info" },
  ok: { pill: "bg-ok-bg text-ok", dot: "bg-ok" },
  warn: { pill: "bg-warn-bg text-warn", dot: "bg-warn" },
  bad: { pill: "bg-bad-bg text-bad", dot: "bg-bad" },
};

export interface StatusPillProps {
  tone?: PillTone;
  children: string;
  /** Animate the dot, for work that is happening right now. */
  live?: boolean;
  className?: string;
}

/** Status only. Red stays meaningful, so use `bad` for real problems and `brand` for emphasis. */
export function StatusPill({ tone = "neutral", live = false, className = "", children }: StatusPillProps) {
  const t = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 t-label ${t.pill} ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${t.dot} ${live ? "animate-pulse-ring" : ""}`} />
      {children}
    </span>
  );
}
