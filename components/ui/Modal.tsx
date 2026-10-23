"use client";

import { useId, useRef, type ReactNode } from "react";
import { useEscape, useFocusTrap, usePresence, useScrollLock } from "./_hooks";
import { IconButton } from "./IconButton";
import { Portal } from "./Portal";

const SIZES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" } as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Buttons, right-aligned. */
  footer?: ReactNode;
  size?: keyof typeof SIZES;
  /** Block Escape and backdrop dismissal while work is in flight. */
  dismissible?: boolean;
}

/** Centered dialog. Traps focus, locks scroll, closes on Escape or backdrop click, springs in and out. */
export function Modal({ open, onClose, title, description, children, footer, size = "md", dismissible = true }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, state } = usePresence(open, 180);

  useScrollLock(mounted);
  useFocusTrap(panel, open && mounted);
  useEscape(() => dismissible && onClose(), open);

  if (!mounted) return null;
  return (
    <Portal>
      <div data-state={state} className="fixed inset-0 z-[var(--z-overlay)] flex items-end data-[state=closed]:pointer-events-none justify-center p-0 sm:items-center sm:p-6">
        <div
          aria-hidden="true"
          data-state={state}
          onClick={() => dismissible && onClose()}
          className="absolute inset-0 bg-scrim backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
        />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          data-state={state}
          className={`relative flex max-h-[min(90vh,46rem)] w-full flex-col overflow-hidden rounded-t-xl border border-border bg-surface shadow-overlay outline-none data-[state=closed]:animate-pop-out data-[state=open]:animate-rise-in sm:rounded-xl ${SIZES[size]}`}
        >
          <span aria-hidden="true" className="h-1 w-full bg-primary [clip-path:polygon(0_0,calc(100%-24px)_0,100%_100%,0_100%)]" />
          <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
            <div>
              <h2 id={titleId} className="t-h3">
                {title}
              </h2>
              {description ? (
                <p id={descId} className="mt-1 t-small">
                  {description}
                </p>
              ) : null}
            </div>
            {dismissible ? <IconButton label="Close" icon="x" size="sm" onClick={onClose} /> : null}
          </header>
          {children ? <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3">{children}</div> : null}
          {footer ? <footer className="flex flex-wrap justify-end gap-2 border-t border-border bg-n-50 px-6 py-4">{footer}</footer> : null}
        </div>
      </div>
    </Portal>
  );
}
