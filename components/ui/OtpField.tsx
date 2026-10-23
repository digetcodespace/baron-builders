"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { FieldError } from "./FieldError";

export interface OtpFieldProps {
  /** Number of digits. Must match the Supabase project's one-time-code length. */
  length?: number;
  label?: string;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

/** The emailed one-time code: one box per digit, paste-friendly, auto-advancing. */
export function OtpField({
  length = 8,
  label = "One-time code",
  onComplete,
  onChange,
  error,
  disabled,
  className = "",
}: OtpFieldProps) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ""));
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    setDigits(next);
    const code = next.join("");
    onChange?.(code);
    if (code.length === length && !next.includes("")) onComplete(code);
  };

  const fill = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, "").slice(0, length - start).split("");
    if (incoming.length === 0) return;
    const next = [...digits];
    incoming.forEach((d, i) => {
      next[start + i] = d;
    });
    commit(next);
    refs.current[Math.min(start + incoming.length, length - 1)]?.focus();
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        commit(next);
      } else if (index > 0) {
        next[index - 1] = "";
        commit(next);
        refs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onPaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fill(index, event.clipboardData.getData("text"));
  };

  return (
    <div className={className}>
      <p className="mb-2 t-label text-n-600">{label}</p>
      <div role="group" aria-label={label} className="flex gap-1.5 sm:gap-2">
        {digits.map((digit, index) => (
          <div
            key={index}
            data-focused={focusIndex === index || undefined}
            data-invalid={Boolean(error) || undefined}
            className="group/otp relative h-14 w-full max-w-11 overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-inset)] transition-[border-color,box-shadow,background-color] duration-[var(--dur-fast)] data-[focused]:border-primary-line data-[focused]:shadow-[var(--focus-ring)] data-[invalid]:animate-shake data-[invalid]:border-bad"
          >
            <input
              ref={(el) => {
                refs.current[index] = el;
              }}
              value={digit}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={disabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              onFocus={(event) => {
                setFocusIndex(index);
                event.target.select();
              }}
              onBlur={() => setFocusIndex(null)}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");
                if (value.length > 1) return fill(index, value);
                const next = [...digits];
                next[index] = value;
                commit(next);
                if (value && index < length - 1) refs.current[index + 1]?.focus();
              }}
              onKeyDown={(event) => onKeyDown(index, event)}
              onPaste={(event) => onPaste(index, event)}
              className={`h-full w-full bg-transparent text-center font-display text-[length:var(--fs-h3)] font-extrabold text-text outline-none focus-visible:shadow-none ${digit ? "animate-pop-in" : ""}`}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] [clip-path:polygon(0_0,calc(100%-var(--slant))_0,100%_100%,0_100%)] group-data-[focused]/otp:scale-x-100 group-data-[invalid]/otp:scale-x-100 group-data-[invalid]/otp:bg-bad"
            />
          </div>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}
