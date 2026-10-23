import type { ReactNode } from "react";
import { TONES, TONE_TILE, toneStyle, type Tone } from "./_tone";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";

export interface BannerProps {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

/**
 * In-page banner. A hairline surface with a soft tone wash that fades from the
 * icon side, a tinted icon tile, and a faint window-grid texture at the far
 * edge. The tone shows in the tile and the wash, never as a colored stripe.
 */
export function Banner({ tone = "info", title, children, actionLabel, onAction, onDismiss }: BannerProps) {
  return (
    <div
      role="status"
      style={{
        ...toneStyle(tone),
        background: "linear-gradient(100deg, color-mix(in srgb, var(--tone) 8%, var(--surface)) 0%, var(--surface) 62%)",
      }}
      className="relative flex animate-expand items-center gap-4 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--tone)_16%,var(--border))] py-3.5 pl-3.5 pr-3"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-56 opacity-[.22] [background-image:radial-gradient(var(--tone)_1.1px,transparent_1.5px)] [background-size:11px_11px] [mask-image:linear-gradient(to_left,black,transparent)]"
      />
      <span className={`${TONE_TILE} relative h-11 w-11 animate-chip-pop`}>
        <Icon name={TONES[tone].icon} size={22} />
      </span>
      <div className="relative min-w-0 flex-1 t-ui">
        {title ? <p className="font-semibold text-text">{title}</p> : null}
        <div className={title ? "mt-0.5 text-n-700" : "text-text"}>{children}</div>
      </div>
      {actionLabel && onAction ? (
        <Button size="sm" variant="secondary" onClick={onAction} className="relative">
          {actionLabel}
        </Button>
      ) : null}
      {onDismiss ? <IconButton label="Dismiss" icon="x" size="sm" onClick={onDismiss} className="relative" /> : null}
    </div>
  );
}
