"use client";

import { useEffect, useState, type ReactNode, type Ref } from "react";
import { Icon } from "./Icon";

export interface FieldShellProps {
  /** The id of the control, so the label points at it. */
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  /** The control has focus (or its popover is open). */
  focused: boolean;
  /** The control holds a value, so the label floats up. */
  filled: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  /** Top-aligned label for text areas. */
  multiline?: boolean;
  className?: string;
  boxRef?: Ref<HTMLDivElement>;
  onBoxPointerDown?: () => void;
}

/** Class for the actual <input>/<textarea> sitting inside the shell. The shell draws every ring, so the control draws none. */
export const FIELD_CONTROL =
  "block w-full min-w-0 bg-transparent px-3.5 pb-1.5 pt-[1.45rem] t-ui text-text outline-none placeholder:text-transparent focus:placeholder:text-n-400 disabled:cursor-not-allowed [&:-webkit-autofill]:[-webkit-text-fill-color:var(--text)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-out]";

const EASE = "duration-[var(--dur-base)] ease-[var(--ease-out)]";

/**
 * The shared frame for every labeled control: a floating label that glides up,
 * a focus ring that fades in, and the signature "slab": a short slanted red
 * bar that draws itself along the bottom edge (the logo's ground slab). Hint
 * and error slide open below without pushing the page around abruptly.
 */
export function FieldShell({
  id,
  label,
  hint,
  error,
  disabled,
  focused,
  filled,
  leading,
  trailing,
  children,
  multiline,
  className = "",
  boxRef,
  onBoxPointerDown,
}: FieldShellProps) {
  const raised = focused || filled;
  const invalid = Boolean(error);
  const message = error ?? hint;
  // Remember the last error so its text can fade out while the row collapses.
  const [lastError, setLastError] = useState<string | null>(null);
  useEffect(() => {
    if (!error) return;
    const frame = requestAnimationFrame(() => setLastError(error));
    return () => cancelAnimationFrame(frame);
  }, [error]);
  const closingError = !message ? lastError : null;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  // The label only ever moves with transform, so it glides on the GPU and never reflows.
  const labelPosition = multiline
    ? raised
      ? "top-4 -translate-y-2.5 scale-[.78]"
      : "top-4 translate-y-0 scale-100"
    : raised
      ? "top-1/2 -translate-y-[calc(50%+9px)] scale-[.78]"
      : "top-1/2 -translate-y-1/2 scale-100";

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={boxRef}
        onPointerDown={onBoxPointerDown}
        data-focused={focused || undefined}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={`group/box relative flex items-stretch overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-field)] transition-[border-color,box-shadow,background-color] ${EASE} hover:border-n-300 data-[focused]:border-primary-line data-[focused]:shadow-[var(--shadow-field-focus)] data-[invalid]:animate-shake data-[invalid]:border-bad data-[invalid]:shadow-[var(--shadow-field-error)] data-[disabled]:bg-n-50 data-[disabled]:opacity-60`}
      >
        {leading ? (
          <div className={`flex items-center pl-3.5 text-n-500 transition-colors ${EASE} group-data-[focused]/box:text-primary`}>{leading}</div>
        ) : null}
        <div className="relative min-w-0 flex-1" aria-describedby={describedBy}>
          {children}
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-3.5 max-w-[calc(100%-1.75rem)] origin-left truncate text-muted will-change-transform transition-[transform,color] ${EASE} t-ui ${labelPosition} ${raised ? "text-n-600" : ""} group-data-[focused]/box:text-primary! group-data-[invalid]/box:text-bad!`}
          >
            {label}
          </label>
        </div>
        {trailing ? <div className="flex items-center pr-2 text-n-500">{trailing}</div> : null}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 left-3 right-3 h-[3px] origin-left scale-x-0 rounded-t-full bg-primary opacity-0 transition-[transform,opacity] ${EASE} group-data-[focused]/box:scale-x-100 group-data-[focused]/box:opacity-100 group-data-[invalid]/box:scale-x-100 group-data-[invalid]/box:bg-bad group-data-[invalid]/box:opacity-100`}
        />
      </div>
      <div
        aria-live="polite"
        aria-hidden={!message}
        className={`grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] ${message ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          {error ? (
            <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 t-small text-bad!">
              <Icon name="alert-circle" size={14} />
              {error}
            </p>
          ) : hint ? (
            <p id={`${id}-hint`} className="mt-1.5 t-small">
              {hint}
            </p>
          ) : closingError ? (
            <p className="mt-1.5 flex items-center gap-1.5 t-small text-bad!">
              <Icon name="alert-circle" size={14} />
              {closingError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
