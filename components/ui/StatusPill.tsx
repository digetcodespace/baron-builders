import type { CSSProperties } from "react";

export type PillTone = "neutral" | "brand" | "info" | "ok" | "warn" | "bad";

const TONE_VAR: Record<PillTone, string> = {
  neutral: "var(--n-500)",
  brand: "var(--primary)",
  info: "var(--info)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  bad: "var(--bad)",
};

export interface StatusPillProps {
  tone?: PillTone;
  children: string;
  /** The window flickers, for work that is happening right now. */
  live?: boolean;
  className?: string;
}

/**
 * A status "plate" with a small window on the left, a nod to the buildings in
 * the logo. The window is dark for a stage that is done, lit for one in
 * progress, and flickers when work is live. Tinted from one tone variable, so
 * every status reads as part of the same family.
 */
export function StatusPill({ tone = "neutral", live = false, className = "", children }: StatusPillProps) {
  return (
    <span
      style={{ ["--tone" as string]: TONE_VAR[tone] } as CSSProperties}
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border border-[color-mix(in_srgb,var(--tone)_26%,var(--surface))] bg-[color-mix(in_srgb,var(--tone)_9%,var(--surface))] py-1 pl-1.5 pr-2.5 t-label text-[color-mix(in_srgb,var(--tone)_78%,var(--baron-ink))] ${className}`}
    >
      <span aria-hidden="true" className="relative flex h-[18px] w-[18px] items-center justify-center rounded-[6px] bg-[var(--tone)]">
        <span className={`h-2 w-2 rounded-[2px] bg-[color-mix(in_srgb,var(--surface)_88%,var(--tone))] ${live ? "animate-twinkle" : ""}`} />
      </span>
      {children}
    </span>
  );
}
