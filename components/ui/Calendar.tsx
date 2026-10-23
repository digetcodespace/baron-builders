"use client";

import { useState, type KeyboardEvent } from "react";
import { IconButton } from "./IconButton";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
}

/** Month grid. Arrow keys move by day and week, PageUp/PageDown by month. */
export function Calendar({ value, onChange, min, max }: CalendarProps) {
  const selected = value ? fromIso(value) : null;
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date((selected ?? today).getFullYear(), (selected ?? today).getMonth(), 1));
  const [focusDay, setFocusDay] = useState<string>(toIso(selected ?? today));
  const [slide, setSlide] = useState<"next" | "prev" | null>(null);

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ];

  const disabled = (iso: string) => Boolean((min && iso < min) || (max && iso > max));
  const shiftMonth = (delta: number) => {
    setSlide(delta > 0 ? "next" : "prev");
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const base = fromIso(focusDay) ?? today;
    const move = (days: number) => {
      event.preventDefault();
      const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
      setFocusDay(toIso(next));
      if (next.getMonth() !== cursor.getMonth() || next.getFullYear() !== cursor.getFullYear()) {
        setSlide(next > base ? "next" : "prev");
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

  return (
    <div className="w-72 max-w-full p-3" onKeyDown={onKeyDown}>
      <div className="mb-2 flex items-center justify-between">
        <IconButton label="Previous month" icon="chevron-left" size="sm" onClick={() => shiftMonth(-1)} />
        <p aria-live="polite" className="font-display text-[length:var(--fs-ui)] font-extrabold">
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </p>
        <IconButton label="Next month" icon="chevron-right" size="sm" onClick={() => shiftMonth(1)} />
      </div>
      <div className="mb-1 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 t-label text-n-500">
            {d}
          </span>
        ))}
      </div>
      <div
        key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
        role="grid"
        className={`grid grid-cols-7 gap-y-0.5 ${slide === "next" ? "animate-fade-in" : slide === "prev" ? "animate-fade-in" : ""}`}
      >
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const iso = toIso(date);
          const isSelected = value === iso;
          const isToday = toIso(today) === iso;
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
              className={`relative mx-auto flex aspect-square w-full max-w-9 items-center justify-center rounded-full t-ui transition-[background-color,color,transform] duration-[var(--dur-fast)] hover:bg-ink-soft active:scale-90 disabled:pointer-events-none disabled:opacity-30 ${isSelected ? "bg-primary font-semibold text-on-primary shadow-[var(--shadow-btn)] hover:bg-primary-hover" : ""} ${isToday && !isSelected ? "font-semibold text-primary" : ""}`}
            >
              {date.getDate()}
              {isToday && !isSelected ? <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
