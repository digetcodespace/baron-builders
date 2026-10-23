"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { FieldShell } from "./_FieldShell";
import { useAnchoredPosition, useClickOutside, useControllable, useEscape, usePresence } from "./_hooks";
import { Calendar, fromIso } from "./Calendar";
import { Icon } from "./Icon";
import { Portal } from "./Portal";

export interface DateFieldProps {
  label: string;
  /** `YYYY-MM-DD`, or null. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (iso: string) => void;
  min?: string;
  max?: string;
  hint?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

function display(iso: string | null) {
  const date = iso ? fromIso(iso) : null;
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
}

/** Labeled date picker with a custom calendar popover. */
export function DateField({ label, value, defaultValue, onChange, min, max, hint, error, disabled, className }: DateFieldProps) {
  const id = useId();
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue ?? null, (v) => {
    if (v) onChange?.(v);
  });
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { mounted, state } = usePresence(open, 140);

  useAnchoredPosition(boxRef, panelRef, mounted, { offset: 6 });
  useEscape(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, open);
  useClickOutside([boxRef, panelRef], () => setOpen(false), open);

  return (
    <>
      <FieldShell
        id={id}
        label={label}
        hint={hint}
        error={error}
        disabled={disabled}
        focused={open}
        filled={selected !== null}
        boxRef={boxRef}
        className={className}
        trailing={<Icon name="calendar" size={18} className={open ? "text-primary" : ""} />}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="block w-full truncate bg-transparent px-3.5 pb-1.5 pt-[1.45rem] text-left t-ui text-text outline-none focus-visible:shadow-none disabled:cursor-not-allowed"
        >
          {display(selected) || <span className="text-transparent">Pick a date</span>}
        </button>
      </FieldShell>
      {mounted ? (
        <Portal>
          <div
            ref={panelRef}
            role="dialog"
            aria-label={`Choose ${label}`}
            data-state={state}
            style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
            className="z-[var(--z-popover)] rounded-lg border border-border bg-surface shadow-overlay data-[state=closed]:pointer-events-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
          >
            <Calendar
              value={selected}
              min={min}
              max={max}
              onChange={(iso) => {
                setSelected(iso);
                setOpen(false);
                triggerRef.current?.focus();
              }}
            />
          </div>
        </Portal>
      ) : null}
    </>
  );
}
