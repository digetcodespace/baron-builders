"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useControllable } from "./_hooks";

export interface TabItem {
  id: string;
  label: string;
  /** Small count or status after the label. */
  badge?: string | number;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  label: string;
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

/** Underlined tabs. A red slab slides under the active tab; arrow keys move between them. */
export function Tabs({ label, tabs, value, defaultValue, onChange, className = "" }: TabsProps) {
  const base = useId();
  const [selected, setSelected] = useControllable<string>(value, defaultValue ?? tabs[0]?.id ?? "", onChange);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[selected];
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [selected, tabs]);

  const enabled = tabs.filter((t) => !t.disabled);
  const onKeyDown = (event: KeyboardEvent) => {
    const at = enabled.findIndex((t) => t.id === selected);
    let next = at;
    if (event.key === "ArrowRight") next = (at + 1) % enabled.length;
    else if (event.key === "ArrowLeft") next = (at - 1 + enabled.length) % enabled.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else return;
    event.preventDefault();
    setSelected(enabled[next].id);
    refs.current[enabled[next].id]?.focus();
  };

  const active = tabs.find((t) => t.id === selected);
  return (
    <div className={className}>
      <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="relative flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.id === selected;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              id={`${base}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${base}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => setSelected(tab.id)}
              className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 t-ui transition-colors duration-[var(--dur-fast)] disabled:pointer-events-none disabled:opacity-40 ${isActive ? "font-semibold text-text" : "text-muted hover:text-text"}`}
            >
              {tab.label}
              {tab.badge !== undefined ? (
                <span className={`rounded-full px-1.5 py-px t-label transition-colors ${isActive ? "bg-primary text-on-primary" : "bg-ink-soft text-n-600"}`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
        {bar ? (
          <span
            aria-hidden="true"
            className="absolute -bottom-px h-[3px] bg-primary transition-[left,width] duration-[var(--dur-slow)] ease-[var(--ease-spring)] [clip-path:polygon(0_0,calc(100%-var(--slant))_0,100%_100%,0_100%)]"
            style={{ left: bar.left, width: bar.width }}
          />
        ) : null}
      </div>
      {active?.content ? (
        <div
          key={active.id}
          role="tabpanel"
          id={`${base}-panel-${active.id}`}
          aria-labelledby={`${base}-tab-${active.id}`}
          tabIndex={0}
          className="animate-expand pt-4 outline-none"
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
