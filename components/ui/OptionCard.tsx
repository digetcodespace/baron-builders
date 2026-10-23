"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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
 * Selection-sheet choices as one connected strip: cells share hairline dividers
 * (no shadows, no floating cards). In pick-one mode a single red frame slides
 * from choice to choice; in add-on mode each chosen cell frames itself.
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

  // Pick-one: measure the chosen cell so one frame can glide to it.
  const grid = useRef<HTMLDivElement>(null);
  const cells = useRef<Record<string, HTMLLabelElement | null>>({});
  const [frame, setFrame] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    if (multiple || single === null) return;
    const measure = () => {
      const el = cells.current[single];
      if (el) setFrame({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (grid.current) observer.observe(grid.current);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [multiple, single, options, columns]);

  return (
    <fieldset className={className}>
      <legend className="mb-2.5 t-label text-n-600">{legend}</legend>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div ref={grid} className={`relative -mb-px -mr-px grid ${COLUMNS[columns]}`}>
          {options.map((option) => {
            const selected = isSelected(option.value);
            return (
              <label
                key={option.value}
                ref={(el) => {
                  cells.current[option.value] = el;
                }}
                data-selected={selected || undefined}
                className={`group/opt relative flex gap-4 bg-surface p-5 shadow-[inset_-1px_-1px_0_var(--border)] transition-colors duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:bg-n-50 has-[:focus-visible]:bg-n-50 ${option.disabled ? "pointer-events-none opacity-45" : ""}`}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={groupName}
                  value={option.value}
                  checked={selected}
                  disabled={option.disabled}
                  onChange={() => toggle(option.value)}
                  className="peer sr-only"
                />
                {option.media ? <div className="shrink-0 self-start overflow-hidden rounded-lg">{option.media}</div> : null}
                <div className="min-w-0 flex-1">
                  <p className="t-ui font-semibold text-text">{option.title}</p>
                  {option.description ? <p className="mt-1 t-small">{option.description}</p> : null}
                  {option.priceCents !== undefined ? (
                    <p className="mt-3 text-[length:var(--fs-small)] font-semibold">
                      {option.priceCents === 0 ? (
                        <span className="text-ok">Included</span>
                      ) : (
                        <Money cents={option.priceCents} compact />
                      )}
                    </p>
                  ) : null}
                </div>
                {/* The choice marker: a ring that fills with a drawn check. */}
                <span
                  aria-hidden="true"
                  className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border transition-[background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-smooth)] ${multiple ? "rounded-md" : "rounded-full"} ${selected ? "border-primary bg-primary text-on-primary" : "border-n-300 bg-surface group-hover/opt:border-n-400"}`}
                >
                  <Icon
                    name="check"
                    size={14}
                    strokeWidth={3}
                    className={`transition-[opacity,scale] duration-[var(--dur-base)] ease-[var(--ease-spring)] ${selected ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                  />
                </span>
                {/* Add-on mode: each chosen cell frames itself. */}
                {multiple ? (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-1.5 rounded-xl border-[1.5px] border-primary bg-[var(--tint-wash)] transition-opacity duration-[var(--dur-base)] ease-[var(--ease-smooth)] ${selected ? "opacity-100" : "opacity-0"}`}
                  />
                ) : null}
              </label>
            );
          })}
          {/* Pick-one mode: one frame that glides between cells. */}
          {!multiple && frame ? (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-0 rounded-xl border-[1.5px] border-primary bg-[var(--tint-wash)] ${ready ? "transition-[translate,width,height] duration-[520ms] ease-[var(--ease-draw)]" : ""}`}
              style={{ translate: `${frame.x + 6}px ${frame.y + 6}px`, width: frame.w - 13, height: frame.h - 13 }}
            />
          ) : null}
        </div>
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
