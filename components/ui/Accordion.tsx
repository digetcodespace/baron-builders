"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

export interface AccordionItem {
  id: string;
  title: string;
  /** Short text at the right of the title, e.g. a count or a price. */
  meta?: ReactNode;
  content: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow several panels open at once. */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

/** Collapsible sections (the sections of a selection sheet). Height animates smoothly. */
export function Accordion({ items, multiple = false, defaultOpen = [], className = "" }: AccordionProps) {
  const base = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const toggle = (id: string) =>
    setOpen((current) => (current.includes(id) ? current.filter((x) => x !== id) : multiple ? [...current, id] : [id]));

  return (
    <div className={`divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface shadow-low ${className}`}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={`${base}-${item.id}-button`}
                aria-expanded={isOpen}
                aria-controls={`${base}-${item.id}-panel`}
                onClick={() => toggle(item.id)}
                className="group/acc flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-[var(--dur-fast)] hover:bg-n-50"
              >
                <span className="flex-1 t-ui font-semibold">{item.title}</span>
                {item.meta ? <span className="t-small">{item.meta}</span> : null}
                <Icon
                  name="chevron-down"
                  size={18}
                  className={`text-n-500 transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] ${isOpen ? "rotate-180 text-primary" : ""}`}
                />
              </button>
            </h3>
            <div
              id={`${base}-${item.id}-panel`}
              role="region"
              aria-labelledby={`${base}-${item.id}-button`}
              className={`grid transition-[grid-template-rows] duration-[var(--dur-slow)] ease-[var(--ease-out)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-1">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
