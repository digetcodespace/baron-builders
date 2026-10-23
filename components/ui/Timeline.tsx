import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export interface TimelineEvent {
  id: string;
  title: ReactNode;
  detail?: ReactNode;
  /** Who and when, e.g. "Maria · Oct 22, 2:14 PM". */
  meta?: string;
  icon?: IconName;
  tone?: "neutral" | "brand" | "ok";
}

const DOT = {
  neutral: "bg-surface text-n-600 border-n-300",
  brand: "bg-primary text-on-primary border-primary",
  ok: "bg-ok text-on-primary border-ok",
} as const;

/** A house's history: every choice, signature, email and payment, newest first. */
export function Timeline({ events, className = "" }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={`relative ${className}`}>
      {events.map((event, index) => (
        <li
          key={event.id}
          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          className="relative flex animate-rise-in gap-4 pb-6 last:pb-0"
        >
          {index < events.length - 1 ? <span aria-hidden="true" className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-border" /> : null}
          <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${DOT[event.tone ?? "neutral"]}`}>
            <Icon name={event.icon ?? "clock"} size={15} />
          </span>
          <div className="min-w-0 pt-1">
            <p className="t-ui font-medium">{event.title}</p>
            {event.detail ? <p className="mt-0.5 t-small">{event.detail}</p> : null}
            {event.meta ? <p className="mt-1 t-small text-n-500!">{event.meta}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
