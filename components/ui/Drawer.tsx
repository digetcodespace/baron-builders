"use client";

import { useId, useRef, type ReactNode } from "react";
import { useEscape, useFocusTrap, usePresence, useScrollLock } from "./_hooks";
import { IconButton } from "./IconButton";
import { Portal } from "./Portal";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** `right` is a side panel on desktop and a bottom sheet on phones. */
  side?: "right" | "bottom";
  /** Width of the right-hand panel on desktop. */
  size?: "md" | "lg";
  /** Block Escape and backdrop dismissal while work is in flight. */
  dismissible?: boolean;
}

/** Slide-in panel for a house file, message thread, or any detail that should not leave the page. */
export function Drawer({ open, onClose, title, description, children, footer, side = "right", size = "md", dismissible = true }: DrawerProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, state } = usePresence(open, 220);

  useScrollLock(mounted);
  useFocusTrap(panel, open && mounted);
  useEscape(() => dismissible && onClose(), open);

  if (!mounted) return null;
  const right = side === "right";
  return (
    <Portal>
      <div data-state={state} className="fixed inset-0 z-[var(--z-overlay)] data-[state=closed]:pointer-events-none">
        <div
          aria-hidden="true"
          data-state={state}
          onClick={() => dismissible && onClose()}
          className="absolute inset-0 bg-scrim backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
        />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          data-state={state}
          className={`absolute flex flex-col bg-surface shadow-overlay outline-none ${
            right
              ? `inset-y-0 right-0 w-full ${size === "lg" ? "max-w-xl" : "max-w-md"} border-l border-border data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right`
              : "inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t border-border data-[state=closed]:animate-slide-out-down data-[state=open]:animate-slide-in-up"
          }`}
        >
          {!right ? <span aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-n-300" /> : null}
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div>
              <h2 id={titleId} className="t-h4">
                {title}
              </h2>
              {description ? <p className="mt-0.5 t-small">{description}</p> : null}
            </div>
            <IconButton label="Close" icon="x" size="sm" onClick={onClose} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
          {footer ? <footer className="flex justify-end gap-2 border-t border-border bg-n-50 px-6 py-4">{footer}</footer> : null}
        </div>
      </div>
    </Portal>
  );
}
