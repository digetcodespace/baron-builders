"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useAnchoredPosition, useClickOutside, useEscape, usePresence, type Placement } from "./_hooks";
import { Portal } from "./Portal";

export interface PopoverProps {
  /** Receives the props to spread on your trigger button. */
  trigger: (props: {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-haspopup": "dialog";
    "aria-controls": string;
  }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  placement?: Placement;
  label: string;
}

/** Floating panel anchored to a trigger. Closes on Escape or an outside press, and returns focus. */
export function Popover({ trigger, children, placement = "bottom-start", label }: PopoverProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, state } = usePresence(open, 140);

  const close = useCallback(() => setOpen(false), []);
  useAnchoredPosition(anchor, panel, mounted, { placement });
  useEscape(close, open);
  useClickOutside([anchor, panel], close, open);
  // Return focus to the trigger after the panel closes.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) anchor.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      {trigger({
        ref: anchor,
        onClick: () => setOpen((v) => !v),
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        "aria-controls": id,
      })}
      {mounted ? (
        <Portal>
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label={label}
            data-state={state}
            style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
            className="z-[var(--z-popover)] rounded-lg border border-border bg-surface p-4 shadow-overlay data-[state=closed]:pointer-events-none data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
          >
            {typeof children === "function" ? children(close) : children}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
