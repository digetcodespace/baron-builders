export interface ProgressBarProps {
  /** 0 to 100. Omit for an indeterminate bar. */
  value?: number;
  label?: string;
  showValue?: boolean;
  tone?: "brand" | "ok" | "info";
  className?: string;
}

const FILL = { brand: "bg-primary", ok: "bg-ok", info: "bg-info" } as const;

export function ProgressBar({ value, label, showValue = false, tone = "brand", className = "" }: ProgressBarProps) {
  const determinate = value !== undefined;
  const clamped = determinate ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div className={className}>
      {label || showValue ? (
        <div className="mb-1.5 flex items-center justify-between t-small">
          <span className="font-medium text-text!">{label}</span>
          {showValue && determinate ? <span className="t-mono">{Math.round(clamped)}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={label ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={determinate ? Math.round(clamped) : undefined}
        className="relative h-2 w-full overflow-hidden rounded-full bg-ink-soft"
      >
        {determinate ? (
          <div
            className={`relative h-full overflow-hidden rounded-full transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-out)] ${FILL[tone]}`}
            style={{ width: `${clamped}%` }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-stripes opacity-30 [background-image:repeating-linear-gradient(115deg,transparent_0_8px,var(--on-primary)_8px_14px)] [background-size:28px_100%]"
            />
          </div>
        ) : (
          <div className={`absolute inset-y-0 left-0 w-1/3 animate-indeterminate rounded-full ${FILL[tone]}`} />
        )}
      </div>
    </div>
  );
}
