import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { IconButton } from "./IconButton";

type Tone = "info" | "warn" | "bad" | "ok";

const TONES: Record<Tone, { box: string; icon: IconName; accent: string }> = {
  info: { box: "bg-info-bg text-text", icon: "info", accent: "bg-info text-info" },
  warn: { box: "bg-warn-bg text-text", icon: "alert-triangle", accent: "bg-warn text-warn" },
  bad: { box: "bg-bad-bg text-text", icon: "alert-circle", accent: "bg-bad text-bad" },
  ok: { box: "bg-ok-bg text-text", icon: "check-circle", accent: "bg-ok text-ok" },
};

export interface BannerProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

/** In-page banner. The one banner component; do not roll another. */
export function Banner({ tone = "info", title, children, actionLabel, onAction, onDismiss }: BannerProps) {
  const t = TONES[tone];
  return (
    <div
      role="status"
      className={`relative flex animate-expand items-start gap-3 overflow-hidden rounded-lg py-3 pl-5 pr-3 ${t.box}`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${t.accent.split(" ")[0]}`} />
      <Icon name={t.icon} size={20} className={`mt-0.5 ${t.accent.split(" ")[1]}`} />
      <div className="min-w-0 flex-1 t-ui">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-0.5 font-normal text-n-700" : ""}>{children}</div>
      </div>
      {actionLabel && onAction ? (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? <IconButton label="Dismiss" icon="x" size="sm" onClick={onDismiss} /> : null}
    </div>
  );
}
