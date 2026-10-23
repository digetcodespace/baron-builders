"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { useControllable } from "./_hooks";
import { FieldError } from "./FieldError";

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  legend: string;
  options: RadioOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  name?: string;
  error?: string | null;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

/**
 * A set of exclusive choices. Native radios underneath, so arrow keys and forms
 * work. The dot grows from the center with a spring and a ring bursts off the
 * edge once; neither plays on first render.
 */
export function RadioGroup({
  legend,
  options,
  value,
  defaultValue,
  onChange,
  name,
  error,
  orientation = "vertical",
  className = "",
}: RadioGroupProps) {
  const autoName = useId();
  const groupName = name ?? autoName;
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue ?? null, (v) => {
    if (v !== null) onChange?.(v);
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <fieldset className={className}>
      <legend className="mb-2.5 t-label text-n-600">{legend}</legend>
      <div className={`flex gap-x-6 gap-y-3.5 ${orientation === "vertical" ? "flex-col" : "flex-wrap"}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`group/radio relative flex items-start gap-3 ${option.disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={selected === option.value}
              disabled={option.disabled}
              onChange={() => setSelected(option.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-n-300 bg-surface transition-[border-color,box-shadow,scale] duration-[var(--dur-base)] ease-[var(--ease-smooth)] group-hover/radio:border-n-400 peer-checked:border-primary peer-focus-visible:shadow-[0_0_0_3px_var(--ring-soft)] peer-active:scale-90"
            >
              <span className="h-2.5 w-2.5 scale-0 rounded-full bg-primary transition-[scale] duration-[var(--dur-slow)] ease-[var(--ease-spring)] group-has-[:checked]/radio:scale-100" />
              {ready ? (
                <span className="pointer-events-none absolute -inset-0.5 rounded-full border-2 border-primary opacity-0 group-has-[:checked]/radio:animate-burst" />
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="block t-ui text-text">{option.label}</span>
              {option.description ? <span className="mt-0.5 block t-small">{option.description}</span> : null}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
