import type { ReactNode } from "react";
import { Button } from "./Button";

type Tone = "info" | "warn" | "bad" | "ok";

const TONES: Record<Tone, string> = {
  info: "bg-info-bg text-info",
  warn: "bg-warn-bg text-warn",
  bad: "bg-bad-bg text-bad",
  ok: "bg-ok-bg text-ok",
};

export interface BannerProps {
  tone?: Tone;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

/** In-page banner. The one banner component; do not roll another. */
export function Banner({ tone = "info", children, actionLabel, onAction, onDismiss }: BannerProps) {
  return (
    <div role="status" className={`flex items-center gap-3 rounded-md px-4 py-3 t-ui ${TONES[tone]}`}>
      <div className="flex-1">{children}</div>
      {actionLabel && onAction ? (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? (
        <Button size="sm" variant="ghost" onClick={onDismiss} aria-label="Dismiss">
          Dismiss
        </Button>
      ) : null}
    </div>
  );
}
