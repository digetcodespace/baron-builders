import type { CSSProperties } from "react";
import { Icon } from "./Icon";

export interface StepData {
  id: string;
  label: string;
  /** Short line under the label, e.g. a date or "Appointment Tue 3pm". */
  detail?: string;
}

export interface StepperProps {
  steps: StepData[];
  /** Index of the current step. Steps before it are done. */
  current: number;
  /** `horizontal` runs across on tablets and up, and stacks on phones. `vertical` always stacks. */
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Progress through ordered stages (the vendor flow: Not started to Confirmed by
 * office). The line fills as you advance and the current step pulses.
 */
export function Stepper({ steps, current, orientation = "horizontal", className = "" }: StepperProps) {
  const vertical = orientation === "vertical";
  return (
    <ol className={`flex flex-col ${vertical ? "" : "sm:flex-row sm:items-start"} ${className}`} aria-label="Progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const last = index === steps.length - 1;
        const fill = { "--fill": done ? "100%" : "0%" } as CSSProperties;
        return (
          <li
            key={step.id}
            aria-current={active ? "step" : undefined}
            className={`relative flex gap-4 pb-8 last:pb-0 ${vertical ? "" : "sm:flex-1 sm:flex-col sm:items-center sm:gap-0 sm:pb-0 sm:text-center"}`}
          >
            {!last ? (
              <span
                aria-hidden="true"
                className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 bg-n-200 ${vertical ? "" : "sm:left-1/2 sm:top-[15px] sm:h-0.5 sm:w-full"}`}
              >
                <span
                  style={fill}
                  className={`absolute left-0 top-0 h-[var(--fill)] w-full bg-primary transition-[width,height] duration-[var(--dur-slow)] ease-[var(--ease-out)] ${vertical ? "" : "sm:h-full sm:w-[var(--fill)]"}`}
                />
              </span>
            ) : null}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-display text-[length:var(--fs-small)] font-extrabold transition-[background-color,border-color,color,transform,translate,scale,rotate] duration-[var(--dur-base)] ease-[var(--ease-spring)] ${
                done
                  ? "border-primary bg-primary text-on-primary"
                  : active
                    ? "animate-pulse-ring scale-110 border-primary bg-surface text-primary"
                    : "border-n-300 bg-surface text-n-500"
              }`}
            >
              {done ? <Icon name="check" size={16} strokeWidth={3} className="animate-check-pop" /> : index + 1}
            </span>
            <span className={`pt-1 ${vertical ? "" : "sm:mt-2 sm:px-1 sm:pt-0"}`}>
              <span className={`block t-ui ${active ? "font-semibold text-text" : done ? "text-text" : "text-muted"}`}>{step.label}</span>
              {step.detail ? <span className="mt-0.5 block t-small">{step.detail}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
