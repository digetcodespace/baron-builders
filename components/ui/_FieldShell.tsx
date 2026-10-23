"use client";

import { useEffect, useState, type ReactNode, type Ref } from "react";
import { FieldFrame } from "./_FieldFrame";
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

/**
 * Class for the actual <input>/<textarea> inside the shell. The field is 56px
 * tall: 24px above the text for the floating label, the text line, then 10px
 * below. The frame draws every ring, so the control draws none.
 */
export const FIELD_CONTROL =
  "block w-full min-w-0 bg-transparent px-4 pb-2.5 pt-6 text-[length:var(--fs-ui)] leading-[1.45] font-medium text-text outline-none placeholder:text-transparent focus:placeholder:text-n-400 disabled:cursor-not-allowed [&:-webkit-autofill]:[-webkit-text-fill-color:var(--text)] [&:-webkit-autofill]:[transition:background-color_9999s_ease-out]";

const EASE = "duration-[360ms] ease-[var(--ease-smooth)]";

/**
 * The shared layout for every labeled control: a floating label that glides
 * up, optional leading and trailing slots, and a hint or error that slides
 * open below. The focus treatment itself lives in `FieldFrame`.
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
  const message = error ?? hint;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  // Remember the last error so its text can fade out while the row collapses.
  const [lastError, setLastError] = useState<string | null>(null);
  useEffect(() => {
    if (!error) return;
    const frame = requestAnimationFrame(() => setLastError(error));
    return () => cancelAnimationFrame(frame);
  }, [error]);
  const closingError = !message ? lastError : null;

  // The label moves with transform only, so it glides on the GPU and never reflows.
  // Resting: vertically centered (single line) or on the first line (multi-line).
  // Raised: shrinks to 78% and sits in the top 24px, left-aligned with the text.
  const labelPosition = multiline
    ? raised
      ? "top-[1.15rem] -translate-y-[0.8rem] scale-[.78]"
      : "top-[1.15rem] translate-y-0 scale-100"
    : raised
      ? "top-1/2 -translate-y-[calc(50%+0.8rem)] scale-[.78]"
      : "top-1/2 -translate-y-1/2 scale-100";

  return (
    <div className={`w-full ${className}`}>
      <FieldFrame
        boxRef={boxRef}
        onPointerDown={onBoxPointerDown}
        focused={focused}
        invalid={Boolean(error)}
        disabled={disabled}
        className="flex min-h-14 items-stretch"
      >
        {leading ? (
          <div className={`relative flex items-center pl-4 text-n-500 transition-colors ${EASE} group-data-[focused]/box:text-primary group-focus-within/box:text-primary`}>
            {leading}
          </div>
        ) : null}
        <div className="relative min-w-0 flex-1" aria-describedby={describedBy}>
          {children}
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-4 max-w-[calc(100%-2rem)] origin-left truncate text-muted will-change-transform transition-[transform,color] ${EASE} t-ui ${labelPosition} ${raised ? "text-n-600" : ""} group-data-[focused]/box:text-primary! group-focus-within/box:text-primary! group-data-[invalid]/box:text-bad!`}
          >
            {label}
          </label>
        </div>
        {trailing ? <div className="relative flex items-center pr-3 text-n-500">{trailing}</div> : null}
      </FieldFrame>
      <div
        aria-live="polite"
        aria-hidden={!message}
        className={`grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--ease-out)] ${message ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          {error ? (
            <p id={`${id}-error`} role="alert" className="mt-2 flex items-center gap-1.5 t-small text-bad!">
              <Icon name="alert-circle" size={14} />
              {error}
            </p>
          ) : hint ? (
            <p id={`${id}-hint`} className="mt-2 t-small">
              {hint}
            </p>
          ) : closingError ? (
            <p className="mt-2 flex items-center gap-1.5 t-small text-bad!">
              <Icon name="alert-circle" size={14} />
              {closingError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
