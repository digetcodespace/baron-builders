"use client";

import type { ReactNode, Ref } from "react";
import { FieldError } from "./FieldError";

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

/** Class for the actual <input>/<textarea> sitting inside the shell. */
export const FIELD_CONTROL =
  "block w-full min-w-0 bg-transparent px-3.5 pb-1.5 pt-[1.45rem] t-ui text-text outline-none placeholder:text-transparent focus:placeholder:text-n-400 focus-visible:shadow-none disabled:cursor-not-allowed";

/**
 * The shared frame for every labeled control: a floating label, a focus ring,
 * and the signature "slab" bar that draws itself under the field on focus (its
 * slanted end is the logo's ground slab). Hint and error appear below.
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
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`w-full ${className}`}>
      <div
        ref={boxRef}
        onPointerDown={onBoxPointerDown}
        data-focused={focused || undefined}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className="group/box relative flex items-stretch overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-inset)] transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:border-n-300 data-[focused]:border-primary-line data-[focused]:shadow-[var(--focus-ring)] data-[invalid]:animate-shake data-[invalid]:border-bad data-[disabled]:bg-n-50 data-[disabled]:opacity-60"
      >
        {leading ? <div className="flex items-center pl-3.5 text-n-500 transition-colors group-data-[focused]/box:text-primary">{leading}</div> : null}
        <div className="relative min-w-0 flex-1" aria-describedby={describedBy}>
          {children}
          <label
            htmlFor={id}
            data-raised={raised || undefined}
            className={`pointer-events-none absolute left-3.5 max-w-[calc(100%-1.75rem)] origin-left truncate text-muted transition-[top,transform,color] duration-[var(--dur-base)] ease-[var(--ease-out)] t-ui data-[raised]:top-2 data-[raised]:translate-y-0 data-[raised]:scale-[.78] data-[raised]:text-n-600 group-data-[focused]/box:text-primary! ${multiline ? "top-4" : "top-1/2 -translate-y-1/2"}`}
          >
            {label}
          </label>
        </div>
        {trailing ? <div className="flex items-center pr-2 text-n-500">{trailing}</div> : null}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] [clip-path:polygon(0_0,calc(100%-var(--slant))_0,100%_100%,0_100%)] group-data-[focused]/box:scale-x-100 group-data-[invalid]/box:scale-x-100 group-data-[invalid]/box:bg-bad"
        />
      </div>
      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 t-small">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
