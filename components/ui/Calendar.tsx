"use client";

import { useState, type KeyboardEvent } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export interface CalendarProps {
  /** Selected day, `YYYY-MM-DD`. */
  value: string | null;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

/**
 * Month grid with room to breathe: 44px days in a 7-column grid with gaps, the
 * month in the display face, and a month change that slides in the direction
 * you are travelling. Arrow keys move by day and week, PageUp/PageDown by month.
 */
export function Calendar({ value, onChange, min, max, className = "" }: CalendarProps) {
  const selected = value ? fromIso(value) : null;
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1));
  const [focusDay, setFocusDay] = useState<string>(toIso(selected ?? today));
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ];

  const disabled = (iso: string) => Boolean((min && iso < min) || (max && iso > max));
  const shiftMonth = (delta: number) => {
    setDirection(delta > 0 ? "next" : "prev");
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const base = fromIso(focusDay) ?? today;
    const move = (days: number) => {
      event.preventDefault();
      const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
      setFocusDay(toIso(next));
      if (next.getMonth() !== cursor.getMonth() || next.getFullYear() !== cursor.getFullYear()) {
        setDirection(next > base ? "next" : "prev");
        setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
      }
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-day="${toIso(next)}"]`)?.focus());
    };
    if (event.key === "ArrowRight") move(1);
    else if (event.key === "ArrowLeft") move(-1);
    else if (event.key === "ArrowDown") move(7);
    else if (event.key === "ArrowUp") move(-7);
    else if (event.key === "PageDown") move(30);
    else if (event.key === "PageUp") move(-30);
  };

  const todayIso = toIso(today);
  return (
    <div className={`w-[min(23.5rem,calc(100vw-2.5rem))] p-5 ${className}`} onKeyDown={onKeyDown}>
      <div className="mb-4 flex items-center justify-between">
        <div aria-live="polite" className="pl-1">
          <span className="font-display text-[length:var(--fs-h4)] font-extrabold tracking-tight">{MONTHS[cursor.getMonth()]}</span>
          <span className="ml-2 t-ui text-n-500">{cursor.getFullYear()}</span>
        </div>
        <div className="flex gap-1">
          <IconButton label="Previous month" icon="chevron-left" size="sm" onClick={() => shiftMonth(-1)} />
          <IconButton label="Next month" icon="chevron-right" size="sm" onClick={() => shiftMonth(1)} />
        </div>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1.5 text-center t-label text-n-500">
            {d}
          </span>
        ))}
      </div>
      <div
        key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
        role="grid"
        className={`grid grid-cols-7 gap-1.5 ${direction === "next" ? "animate-cal-next" : "animate-cal-prev"}`}
      >
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;
          const iso = toIso(date);
          const isSelected = value === iso;
          const isToday = todayIso === iso;
          const off = disabled(iso);
          return (
            <button
              key={iso}
              type="button"
              data-day={iso}
              role="gridcell"
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              tabIndex={iso === focusDay ? 0 : -1}
              disabled={off}
              onClick={() => onChange(iso)}
              className={`relative flex aspect-square w-full items-center justify-center rounded-[var(--r-md)] text-[length:var(--fs-ui)] font-medium transition-[background-color,color,scale,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-smooth)] [corner-shape:squircle] active:scale-90 disabled:pointer-events-none disabled:opacity-30 ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : isToday
                    ? "text-primary shadow-[inset_0_0_0_1.5px_var(--primary-line)] hover:bg-primary-soft"
                    : "text-text hover:bg-ink-soft"
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="t-small">{selected ? selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "No date chosen"}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDirection("next");
            setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
            setFocusDay(todayIso);
            if (!disabled(todayIso)) onChange(todayIso);
          }}
        >
          Today
        </Button>
      </div>
    </div>
  );
}
