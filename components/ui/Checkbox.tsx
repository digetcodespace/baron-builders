"use client";

import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Mixed state, e.g. "select all" when only some rows are selected. */
  indeterminate?: boolean;
}

/** Native checkbox underneath (keyboard and forms work), custom box on top with a drawn tick. */
export function Checkbox({ label, description, indeterminate = false, id, className = "", disabled, ...rest }: CheckboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      htmlFor={fieldId}
      className={`group/check relative flex cursor-pointer items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
    >
      <input ref={ref} id={fieldId} type="checkbox" disabled={disabled} className="peer sr-only" {...rest} />
      <span
        aria-hidden="true"
        className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-n-300 bg-surface shadow-[var(--shadow-inset)] transition-[background-color,border-color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/check:border-primary-line peer-checked:border-primary peer-checked:bg-primary peer-indeterminate:border-primary peer-indeterminate:bg-primary peer-focus-visible:shadow-[var(--focus-ring)] peer-active:scale-90 [&_.tick]:[stroke-dashoffset:24] peer-checked:[&_.tick]:[stroke-dashoffset:0] peer-indeterminate:[&_.tick]:opacity-0 [&_.dash]:opacity-0 peer-indeterminate:[&_.dash]:opacity-100"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="absolute text-on-primary">
          <path
            className="tick transition-[stroke-dashoffset] duration-[var(--dur-base)] ease-[var(--ease-out)] [stroke-dasharray:24]"
            d="M5 12.5l4.5 4.5L19 7.5"
          />
          <path className="dash transition-opacity duration-[var(--dur-fast)]" d="M6 12h12" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block t-ui text-text">{label}</span>
        {description ? <span className="mt-0.5 block t-small">{description}</span> : null}
      </span>
    </label>
  );
}
