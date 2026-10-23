"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

export interface SortableListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  /** Names the row for the drag handle and the screen-reader announcement. */
  getLabel: (item: T, index: number) => string;
  onReorder: (next: T[]) => void;
  /** Draw one row. Put `handle` wherever the grip should sit. */
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  className?: string;
}

interface Drag {
  key: string;
  from: number;
  to: number;
  startY: number;
  dy: number;
  /** Distance a neighbor moves to make room: the row's height plus the gap between rows. */
  step: number;
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = list.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/**
 * A vertical list whose rows reorder by dragging the grip, or with the arrow keys while the grip
 * has focus. Rows make room as you drag; nothing jumps. Rows may differ in height.
 */
export function SortableList<T>({ items, getKey, getLabel, onReorder, renderItem, className = "" }: SortableListProps<T>) {
  const rows = useRef(new Map<string, HTMLElement>());
  const [drag, setDrag] = useState<Drag | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, key: string, index: number) => {
    if (event.button !== 0) return;
    const row = rows.current.get(key);
    if (!row) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const box = row.getBoundingClientRect();
    const next = items[index + 1] ? rows.current.get(getKey(items[index + 1]))?.getBoundingClientRect() : null;
    const prev = items[index - 1] ? rows.current.get(getKey(items[index - 1]))?.getBoundingClientRect() : null;
    const gap = next ? next.top - box.bottom : prev ? box.top - prev.bottom : 0;
    setDrag({ key, from: index, to: index, startY: event.clientY, dy: 0, step: box.height + Math.max(0, gap) });
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dy = event.clientY - drag.startY;
    // Where the dragged row's center now sits among the others' original centers.
    const origin = rows.current.get(drag.key)?.getBoundingClientRect();
    if (!origin) return;
    const center = origin.top - drag.dy + origin.height / 2 + dy;
    let to = 0;
    items.forEach((item, i) => {
      if (i === drag.from) return;
      const box = rows.current.get(getKey(item))?.getBoundingClientRect();
      if (!box) return;
      // Neighbors may be displaced by the drag; undo that to compare original centers.
      const shift = i > drag.from && i <= drag.to ? -drag.step : i < drag.from && i >= drag.to ? drag.step : 0;
      const mid = box.top - shift + box.height / 2;
      if (mid < center) to = i < drag.from ? i + 1 : i;
    });
    setDrag({ ...drag, dy, to });
  };

  const finish = () => {
    if (!drag) return;
    if (drag.to !== drag.from) {
      onReorder(move(items, drag.from, drag.to));
      setAnnouncement(`${getLabel(items[drag.from], drag.from)} moved to position ${drag.to + 1} of ${items.length}`);
    }
    setDrag(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    if (!delta) return;
    event.preventDefault();
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    onReorder(move(items, index, to));
    setAnnouncement(`${getLabel(items[index], index)} moved to position ${to + 1} of ${items.length}`);
    // The row keeps its key, so React keeps the same grip; hand focus back after the reorder paints.
    const key = getKey(items[index]);
    requestAnimationFrame(() => rows.current.get(key)?.querySelector<HTMLButtonElement>("[data-grip]")?.focus());
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {items.map((item, index) => {
        const key = getKey(item);
        const dragging = drag?.key === key;
        let offset = 0;
        if (drag && !dragging) {
          if (index > drag.from && index <= drag.to) offset = -drag.step;
          else if (index < drag.from && index >= drag.to) offset = drag.step;
        }
        const handle = (
          <button
            type="button"
            data-grip=""
            aria-label={`Reorder ${getLabel(item, index)}. Use the up and down arrow keys.`}
            onPointerDown={(e) => onPointerDown(e, key, index)}
            onPointerMove={onPointerMove}
            onPointerUp={finish}
            onPointerCancel={() => setDrag(null)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`flex size-8 shrink-0 touch-none items-center justify-center rounded-[var(--r-sm)] text-n-500 transition-colors duration-[var(--dur-fast)] hover:bg-ink-soft hover:text-text focus-visible:outline-2 focus-visible:outline-primary ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <Icon name="menu" size={16} />
          </button>
        );
        return (
          <div
            key={key}
            ref={(el) => {
              if (el) rows.current.set(key, el);
              else rows.current.delete(key);
            }}
            style={{ translate: dragging ? `0 ${drag.dy}px` : `0 ${offset}px` }}
            className={`relative ${dragging ? "z-10 shadow-overlay" : "transition-[translate] duration-[var(--dur-slow)] ease-[var(--ease-smooth)]"}`}
          >
            {renderItem(item, index, handle)}
          </div>
        );
      })}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
