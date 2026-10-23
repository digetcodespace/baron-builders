"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode, type TextareaHTMLAttributes } from "react";
import { FIELD_CONTROL, FieldShell } from "./_FieldShell";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  /** Grow with the content up to this many rows. */
  maxRows?: number;
  /** Show "n / max" when `maxLength` is set. */
  showCount?: boolean;
}

/** Multi-line labeled input that grows as you type. */
export function TextArea({
  label,
  hint,
  error,
  maxRows = 10,
  showCount = false,
  id,
  className,
  value,
  defaultValue,
  disabled,
  rows = 3,
  maxLength,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const ref = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(defaultValue ?? ""));
  const current = value !== undefined ? String(value) : text;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 22;
    const max = line * maxRows + 30;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [current, maxRows]);

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      disabled={disabled}
      focused={focused}
      filled={current.length > 0}
      multiline
      className={className}
    >
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={Boolean(error) || undefined}
        className={`${FIELD_CONTROL} resize-none`}
        onChange={(event) => {
          setText(event.target.value);
          onChange?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {showCount && maxLength ? (
        <span className="pointer-events-none absolute bottom-1.5 right-3 t-small tabular-nums">
          {current.length} / {maxLength}
        </span>
      ) : null}
    </FieldShell>
  );
}
