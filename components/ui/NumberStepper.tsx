"use client";

import { useEffect, useId, useRef } from "react";
import { useControllable } from "./_hooks";
import { FieldFrame } from "./_FieldFrame";
import { AnimatedNumber } from "./AnimatedNumber";
import { Icon } from "./Icon";

export interface NumberStepperProps {
  label: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  className?: string;
}

/** Quantity picker. Press and hold to repeat; the number rolls to its new value. */
export function NumberStepper({
  label,
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  disabled,
  className = "",
}: NumberStepperProps) {
  const id = useId();
  const [count, setCount] = useControllable<number>(value, defaultValue ?? min, onChange);
  const latest = useRef(count);
  const hold = useRef<{ delay?: number; repeat?: number }>({});
  useEffect(() => {
    latest.current = count;
  });

  const bump = (delta: number) => {
    const next = Math.min(max, Math.max(min, latest.current + delta));
    if (next !== latest.current) {
      latest.current = next;
      setCount(next);
    }
  };
  const stop = () => {
    window.clearTimeout(hold.current.delay);
    window.clearInterval(hold.current.repeat);
  };
  const start = (delta: number) => {
    bump(delta);
    hold.current.delay = window.setTimeout(() => {
      hold.current.repeat = window.setInterval(() => bump(delta), 70);
    }, 380);
  };
  useEffect(() => stop, []);

  const button = (delta: number, icon: "minus" | "plus", name: string, off: boolean) => (
    <button
      type="button"
      aria-label={name}
      disabled={disabled || off}
      onPointerDown={() => start(delta)}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          bump(delta);
        }
      }}
      className="flex h-10 w-10 items-center justify-center rounded-md text-text transition-[background-color,transform,translate,scale,rotate] duration-[var(--dur-fast)] hover:bg-ink-soft active:scale-90 disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon name={icon} size={18} />
    </button>
  );

  return (
    <div className={className}>
      <p id={id} className="mb-1.5 t-label text-n-600">
        {label}
      </p>
      <FieldFrame className="inline-flex p-1">
      <div
        role="group"
        aria-labelledby={id}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            bump(step);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            bump(-step);
          }
        }}
        className="relative inline-flex items-center gap-1"
      >
        {button(-step, "minus", `Decrease ${label}`, count <= min)}
        <div
          role="spinbutton"
          tabIndex={0}
          aria-valuenow={count}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label}
          className="min-w-14 px-2 text-center font-display text-[length:var(--fs-h4)] font-extrabold outline-none focus-visible:shadow-none"
        >
          <AnimatedNumber value={count} grouped={false} />
          {unit ? <span className="ml-1 t-small">{unit}</span> : null}
        </div>
        {button(step, "plus", `Increase ${label}`, count >= max)}
      </div>
      </FieldFrame>
    </div>
  );
}
