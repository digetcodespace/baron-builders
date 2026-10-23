type Tone = "neutral" | "info" | "ok" | "warn" | "bad";

const TONES: Record<Tone, string> = {
  neutral: "bg-bg text-muted border border-border",
  info: "bg-info-bg text-info",
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  bad: "bg-bad-bg text-bad",
};

/** Status only. Red stays meaningful, so use `bad` for real problems. */
export function StatusPill({ tone = "neutral", children }: { tone?: Tone; children: string }) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 t-label ${TONES[tone]}`}>{children}</span>
  );
}
