"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useControllable } from "./_hooks";

export interface SegmentOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  label: string;
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** A few exclusive views side by side. A thumb slides under the active one. */
export function SegmentedControl({ label, options, value, defaultValue, onChange, className = "" }: SegmentedControlProps) {
  const [selected, setSelected] = useControllable<string>(value, defaultValue ?? options[0]?.value ?? "", onChange);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[selected];
      if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [selected, options]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = options.findIndex((o) => o.value === selected);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + options.length) % options.length;
    else return;
    event.preventDefault();
    setSelected(options[next].value);
    refs.current[options[next].value]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`relative inline-flex rounded-md bg-ink-soft p-1 ${className}`}
    >
      {thumb ? (
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-0 top-1 rounded-[calc(var(--r-md)-3px)] bg-surface shadow-low transition-[transform,translate,scale,rotate,width] duration-[var(--dur-slow)] ease-[var(--ease-out)]"
          style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[option.value] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setSelected(option.value)}
            className={`relative z-10 h-8 rounded-[calc(var(--r-md)-3px)] px-4 t-ui transition-colors duration-[var(--dur-fast)] ${active ? "font-semibold text-text" : "text-muted hover:text-text"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
