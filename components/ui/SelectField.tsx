"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FieldShell } from "./_FieldShell";
import { useAnchoredPosition, useClickOutside, useControllable, useEscape, usePresence } from "./_hooks";
import { Icon } from "./Icon";
import { Portal } from "./Portal";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  hint?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  /** Add a search box at the top of the list (a combobox). */
  searchable?: boolean;
  placeholder?: string;
  name?: string;
  className?: string;
}

/** Custom listbox. Opens with a spring, flips above when there is no room, fully keyboard-driven. */
export function SelectField({
  label,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  disabled,
  searchable = false,
  placeholder = "Select…",
  name,
  className,
}: SelectFieldProps) {
  const fieldId = useId();
  const listId = `${fieldId}-list`;
  const [selected, setSelected] = useControllable<string | null>(value, defaultValue ?? null, (v) => {
    if (v !== null) onChange?.(v);
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ text: "", at: 0 });
  const { mounted, state } = usePresence(open, 140);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);
  const current = options.find((o) => o.value === selected) ?? null;

  useAnchoredPosition(boxRef, panelRef, mounted, { matchWidth: true, offset: 6 });
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  useEscape(() => {
    close();
    triggerRef.current?.focus();
  }, open);
  useClickOutside([boxRef, panelRef], close, open);

  const openList = () => {
    if (disabled) return;
    const index = visible.findIndex((o) => o.value === selected);
    setActive(index >= 0 ? index : 0);
    setOpen(true);
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  };

  const choose = (option: SelectOption | undefined) => {
    if (!option || option.disabled) return;
    setSelected(option.value);
    close();
    triggerRef.current?.focus();
  };

  const move = (delta: number) => {
    if (visible.length === 0) return;
    let next = active;
    for (let i = 0; i < visible.length; i += 1) {
      next = (next + delta + visible.length) % visible.length;
      if (!visible[next].disabled) break;
    }
    setActive(next);
    panelRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(visible.length - 1);
    } else if (event.key === "Enter" || (event.key === " " && !searchable)) {
      event.preventDefault();
      choose(visible[active]);
    } else if (event.key === "Tab") {
      close();
    } else if (!searchable && event.key.length === 1) {
      const now = Date.now();
      typeahead.current.text = now - typeahead.current.at > 600 ? event.key : typeahead.current.text + event.key;
      typeahead.current.at = now;
      const hit = visible.findIndex((o) => o.label.toLowerCase().startsWith(typeahead.current.text.toLowerCase()));
      if (hit >= 0) setActive(hit);
    }
  };

  return (
    <>
      <FieldShell
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        disabled={disabled}
        focused={open}
        filled={current !== null}
        boxRef={boxRef}
        className={className}
        trailing={
          <Icon
            name="chevron-down"
            size={18}
            className={`transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] ${open ? "rotate-180 text-primary" : ""}`}
          />
        }
      >
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-invalid={Boolean(error) || undefined}
          disabled={disabled}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
          className="block w-full truncate bg-transparent px-3.5 pb-1.5 pt-[1.45rem] text-left t-ui text-text outline-none focus-visible:shadow-none disabled:cursor-not-allowed"
        >
          {current ? current.label : <span className="text-transparent">{placeholder}</span>}
        </button>
        {name ? <input type="hidden" name={name} value={selected ?? ""} /> : null}
      </FieldShell>
      {mounted ? (
        <Portal>
          <div
            ref={panelRef}
            data-state={state}
            style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
            className="z-[var(--z-popover)] min-w-40 overflow-hidden rounded-lg border border-border bg-surface shadow-overlay data-[state=closed]:pointer-events-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
          >
            {searchable ? (
              <div className="border-b border-border p-2">
                <div className="flex items-center gap-2 rounded-md bg-n-50 px-2.5">
                  <Icon name="search" size={16} className="text-n-500" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Search…"
                    aria-label="Search options"
                    className="h-9 w-full bg-transparent t-ui outline-none placeholder:text-n-400 focus-visible:shadow-none"
                  />
                </div>
              </div>
            ) : null}
            <ul id={listId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto p-1.5">
              {visible.length === 0 ? <li className="px-3 py-6 text-center t-small">No matches</li> : null}
              {visible.map((option, index) => {
                const isSelected = option.value === selected;
                return (
                  <li
                    key={option.value}
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 t-ui transition-colors duration-[var(--dur-fast)] ${index === active ? "bg-ink-soft" : ""} ${option.disabled ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${isSelected ? "font-semibold text-primary" : ""}`}>{option.label}</span>
                      {option.description ? <span className="block truncate t-small">{option.description}</span> : null}
                    </span>
                    {isSelected ? <Icon name="check" size={16} className="animate-check-pop text-primary" /> : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </Portal>
      ) : null}
    </>
  );
}
