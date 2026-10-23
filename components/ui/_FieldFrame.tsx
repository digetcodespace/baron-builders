"use client";

import type { ReactNode, Ref } from "react";

export interface FieldFrameProps {
  /** Show the focus treatment (a popover-driven field passes `open`). Plain focus is also detected with CSS. */
  focused?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  boxRef?: Ref<HTMLDivElement>;
  onPointerDown?: () => void;
}

const FADE = "duration-[420ms] ease-[var(--ease-smooth)]";

/**
 * The frame every field sits in. Focus arrives in three smooth layers, none of
 * which move anything: the border color fades in all the way around, a soft
 * halo fades in outside it, and a red line draws left to right along the whole
 * bottom edge (and leaves to the right on blur). Only opacity and transform
 * animate, so it stays on the GPU.
 */
export function FieldFrame({ focused, invalid, disabled, children, className = "", boxRef, onPointerDown }: FieldFrameProps) {
  return (
    <div
      ref={boxRef}
      onPointerDown={onPointerDown}
      data-focused={focused || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={`group/box relative rounded-md border border-border bg-surface transition-[border-color,background-color] duration-[320ms] ease-[var(--ease-smooth)] hover:border-n-300 data-[invalid]:animate-shake data-[disabled]:bg-n-50 data-[disabled]:opacity-60 ${className}`}
    >
      {/* Soft halo */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 shadow-[0_0_0_4px_var(--ring-soft)] transition-opacity ${FADE} group-data-[focused]/box:opacity-100 group-focus-within/box:opacity-100 group-data-[invalid]/box:opacity-100 group-data-[invalid]/box:shadow-[0_0_0_4px_var(--ring-soft-bad)]`}
      />
      {/* Border color, fading in around the whole edge */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-px rounded-[inherit] border border-primary opacity-0 transition-opacity ${FADE} group-data-[focused]/box:opacity-100 group-focus-within/box:opacity-100 group-data-[invalid]/box:border-bad group-data-[invalid]/box:opacity-100`}
      />
      {/* The line: draws left to right across the full width, clipped to the rounded corners */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span
          className="absolute inset-x-0 bottom-0 h-[2px] origin-right scale-x-0 bg-primary transition-transform duration-[720ms] ease-[var(--ease-draw)] group-data-[focused]/box:origin-left group-data-[focused]/box:scale-x-100 group-focus-within/box:origin-left group-focus-within/box:scale-x-100 group-data-[invalid]/box:origin-left group-data-[invalid]/box:scale-x-100 group-data-[invalid]/box:bg-bad"
        />
      </span>
      {children}
    </div>
  );
}
