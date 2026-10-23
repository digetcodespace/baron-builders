"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useAnchoredPosition, useClickOutside, useEscape, usePresence, type Placement } from "./_hooks";
import { Icon, type IconName } from "./Icon";
import { Portal } from "./Portal";

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  /** Draw a divider above this item. */
  separated?: boolean;
}

export interface MenuProps {
  items: MenuItem[];
  label: string;
  placement?: Placement;
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
    "aria-expanded": boolean;
    "aria-haspopup": "menu";
    "aria-controls": string;
  }) => ReactNode;
}

/** Dropdown of actions. Arrow keys move, Enter selects, Escape closes; items cascade in. */
export function Menu({ items, label, placement = "bottom-end", trigger }: MenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, state } = usePresence(open, 140);

  const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);
  const close = () => {
    setOpen(false);
    anchor.current?.focus();
  };
  useAnchoredPosition(anchor, panel, mounted, { placement, offset: 6 });
  useEscape(close, open);
  useClickOutside([anchor, panel], () => setOpen(false), open);

  const openMenu = () => {
    setActive(enabled[0]?.index ?? 0);
    setOpen(true);
    requestAnimationFrame(() => panel.current?.focus());
  };

  const step = (delta: number) => {
    const at = enabled.findIndex((e) => e.index === active);
    const next = enabled[(at + delta + enabled.length) % enabled.length];
    if (next) setActive(next.index);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(enabled[0]?.index ?? 0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(enabled[enabled.length - 1]?.index ?? 0);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[active];
      if (item && !item.disabled) {
        close();
        item.onSelect();
      }
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <>
      {trigger({
        ref: anchor,
        onClick: () => (open ? setOpen(false) : openMenu()),
        onKeyDown: (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu();
          }
        },
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-controls": id,
      })}
      {mounted ? (
        <Portal>
          <div
            ref={panel}
            id={id}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            data-state={state}
            style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
            className="z-[var(--z-popover)] min-w-52 rounded-lg border border-border bg-surface p-1.5 shadow-overlay outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
          >
            {items.map((item, index) => (
              <div key={item.id}>
                {item.separated ? <div role="separator" className="-mx-1.5 my-1.5 h-px bg-border" /> : null}
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  onPointerEnter={() => setActive(index)}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                  style={{ animationDelay: `${index * 18}ms` }}
                  className={`flex w-full animate-fade-in items-center gap-2.5 rounded-md px-3 py-2 text-left t-ui transition-colors duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-40 ${index === active ? (item.destructive ? "bg-bad-bg" : "bg-ink-soft") : ""} ${item.destructive ? "text-bad" : "text-text"}`}
                >
                  {item.icon ? <Icon name={item.icon} size={18} className={item.destructive ? "" : "text-n-500"} /> : null}
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
