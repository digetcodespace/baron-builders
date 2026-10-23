"use client";

import { useId, type ReactNode } from "react";
import { useControllable } from "./_hooks";
import { FieldError } from "./FieldError";
import { Icon } from "./Icon";
import { Money } from "./Money";

export interface OptionCardData {
  value: string;
  title: string;
  description?: string;
  /** Price in integer cents. Zero shows "Included". */
  priceCents?: number;
  /** Leading visual, e.g. a swatch or product photo. */
  media?: ReactNode;
  disabled?: boolean;
}

interface BaseProps {
  legend: string;
  options: OptionCardData[];
  error?: string | null;
  columns?: 1 | 2 | 3;
  className?: string;
}

export interface SingleProps extends BaseProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
}
export interface MultipleProps extends BaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

const COLUMNS = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" } as const;

/**
 * Selection-sheet choices as cards: pick one (radio) or any number (checkbox).
 * The selected card lifts, outlines in brand red, and a check pops in.
 */
export function OptionCardGroup(props: SingleProps | MultipleProps) {
  const { legend, options, error, columns = 2, className = "" } = props;
  const groupName = useId();
  const multiple = props.multiple === true;

  const [single, setSingle] = useControllable<string | null>(
    multiple ? undefined : (props as SingleProps).value,
    multiple ? null : ((props as SingleProps).defaultValue ?? null),
    (v) => {
      if (!multiple && v !== null) (props as SingleProps).onChange?.(v);
    },
  );
  const [many, setMany] = useControllable<string[]>(
    multiple ? (props as MultipleProps).value : undefined,
    multiple ? ((props as MultipleProps).defaultValue ?? []) : [],
    (v) => {
      if (multiple) (props as MultipleProps).onChange?.(v);
    },
  );

  const isSelected = (value: string) => (multiple ? many.includes(value) : single === value);
  const toggle = (value: string) => {
    if (multiple) setMany(many.includes(value) ? many.filter((v) => v !== value) : [...many, value]);
    else setSingle(value);
  };

  return (
    <fieldset className={className}>
      <legend className="mb-2 t-label text-n-600">{legend}</legend>
      <div className={`grid gap-3 ${COLUMNS[columns]}`}>
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <label
              key={option.value}
              data-selected={selected || undefined}
              className={`group/card relative flex cursor-pointer gap-3 rounded-lg border bg-surface p-4 shadow-low transition-[border-color,box-shadow,transform,background-color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-high data-[selected]:-translate-y-0.5 data-[selected]:border-primary data-[selected]:bg-primary-soft data-[selected]:shadow-[var(--shadow-high)] has-[:focus-visible]:shadow-[var(--focus-ring)] ${selected ? "" : "border-border"} ${option.disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={groupName}
                value={option.value}
                checked={selected}
                disabled={option.disabled}
                onChange={() => toggle(option.value)}
                className="sr-only"
              />
              {option.media ? <div className="shrink-0 overflow-hidden rounded-md">{option.media}</div> : null}
              <div className="min-w-0 flex-1">
                <p className="t-ui font-semibold text-text">{option.title}</p>
                {option.description ? <p className="mt-0.5 t-small">{option.description}</p> : null}
                {option.priceCents !== undefined ? (
                  <p className="mt-2 text-[length:var(--fs-small)] font-semibold">
                    {option.priceCents === 0 ? (
                      <span className="text-ok">Included</span>
                    ) : (
                      <Money cents={option.priceCents} compact />
                    )}
                  </p>
                ) : null}
              </div>
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-[var(--dur-fast)] ${selected ? "border-primary bg-primary text-on-primary" : "border-n-300 bg-surface text-transparent"}`}
              >
                {selected ? <Icon name="check" size={14} className="animate-check-pop" strokeWidth={3} /> : null}
              </span>
            </label>
          );
        })}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
