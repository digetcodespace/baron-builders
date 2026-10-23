"use client";

import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Mixed state, e.g. "select all" when only some rows are selected. */
  indeterminate?: boolean;
}

/**
 * Native checkbox underneath (keyboard and forms work). On check, the box fills
 * outward from its center with a spring, the tick draws itself in, and a ring
 * bursts off the edge once. The burst never plays on first render, so a table
 * full of already-selected rows loads quietly.
 */
export function Checkbox({ label, description, indeterminate = false, id, className = "", disabled, ...rest }: CheckboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const ref = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <label
      htmlFor={fieldId}
      className={`group/check relative flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      <input ref={ref} id={fieldId} type="checkbox" disabled={disabled} className="peer sr-only" {...rest} />
      <span
        aria-hidden="true"
        className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] border border-n-300 bg-surface transition-[border-color,box-shadow,scale] duration-[var(--dur-base)] ease-[var(--ease-smooth)] group-hover/check:border-n-400 peer-checked:border-primary peer-indeterminate:border-primary peer-focus-visible:shadow-[0_0_0_3px_var(--ring-soft)] peer-active:scale-90"
      >
        {/* Fill that grows from the center */}
        <span className="absolute inset-0 scale-0 rounded-[inherit] bg-primary transition-[scale] duration-[var(--dur-slow)] ease-[var(--ease-spring)] group-has-[:checked]/check:scale-100 group-has-[:indeterminate]/check:scale-100" />
        {/* One-time ring burst */}
        {ready ? (
          <span className="pointer-events-none absolute -inset-0.5 rounded-[inherit] border-2 border-primary opacity-0 group-has-[:checked]/check:animate-burst" />
        ) : null}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="relative text-on-primary">
          <path
            className="transition-[stroke-dashoffset,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] [stroke-dasharray:24] [stroke-dashoffset:24] group-has-[:checked]/check:[stroke-dashoffset:0] group-has-[:checked]/check:delay-[90ms] group-has-[:indeterminate]/check:opacity-0"
            d="M5 12.5l4.5 4.5L19 7.5"
          />
          <path
            className="origin-center scale-x-0 opacity-0 transition-[scale,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] group-has-[:indeterminate]/check:scale-x-100 group-has-[:indeterminate]/check:opacity-100"
            d="M6 12h12"
          />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block t-ui text-text">{label}</span>
        {description ? <span className="mt-0.5 block t-small">{description}</span> : null}
      </span>
    </label>
  );
}
