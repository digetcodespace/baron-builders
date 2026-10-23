"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePresence } from "./_hooks";
import { Portal } from "./Portal";

type Side = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: Side;
  className?: string;
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
const GAP = 10;
const EDGE = 8;

/**
 * The only tooltip primitive. Never use a native `title` for a UI affordance
 * (slow, OS-styled, invisible to keyboard focus).
 *
 * The bubble renders in a portal at the top of the page, so no section, toast,
 * table, or `overflow: hidden` ancestor can ever clip it. It waits a beat on
 * hover so it never flickers while the pointer passes over, shows at once on
 * keyboard focus, slides in from the side it belongs to, and slides back out.
 */
export function Tooltip({ content, children, side = "top", className = "" }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const { mounted, state } = usePresence(open, 150);

  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Place the bubble beside its trigger, flip if there is no room, and aim the arrow.
  useEffect(() => {
    if (!mounted) return;
    // Imperative DOM writes on purpose: positioning must not re-render React on scroll.
    const place = () => {
      const a = anchor.current?.getBoundingClientRect();
      const p = panel.current;
      if (!a || !p) return;
      const w = p.offsetWidth;
      const h = p.offsetHeight;
      const room: Record<Side, boolean> = {
        top: a.top - GAP - h > EDGE,
        bottom: a.bottom + GAP + h < window.innerHeight - EDGE,
        left: a.left - GAP - w > EDGE,
        right: a.right + GAP + w < window.innerWidth - EDGE,
      };
      const actual = room[side] || !room[OPPOSITE[side]] ? side : OPPOSITE[side];
      const vertical = actual === "top" || actual === "bottom";
      let top = vertical ? (actual === "top" ? a.top - GAP - h : a.bottom + GAP) : a.top + a.height / 2 - h / 2;
      let left = vertical ? a.left + a.width / 2 - w / 2 : actual === "left" ? a.left - GAP - w : a.right + GAP;
      top = Math.min(Math.max(top, EDGE), window.innerHeight - h - EDGE);
      left = Math.min(Math.max(left, EDGE), window.innerWidth - w - EDGE);
      p.style.top = `${Math.round(top)}px`;
      p.style.left = `${Math.round(left)}px`;
      p.dataset.side = actual;
      // The bubble enters from the trigger's direction.
      p.style.setProperty("--tip-x", actual === "left" ? "8px" : actual === "right" ? "-8px" : "0px");
      p.style.setProperty("--tip-y", actual === "top" ? "8px" : actual === "bottom" ? "-8px" : "0px");
      p.style.transformOrigin = { top: "50% 100%", bottom: "50% 0%", left: "100% 50%", right: "0% 50%" }[actual];
      // Keep the arrow pointing at the trigger even when the bubble was nudged to stay on screen.
      p.style.setProperty("--arrow-x", `${Math.round(a.left + a.width / 2 - left)}px`);
      p.style.setProperty("--arrow-y", `${Math.round(a.top + a.height / 2 - top)}px`);
      p.style.visibility = "visible";
    };
    place();
    const frame = requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [mounted, side]);

  return (
    <span
      ref={anchor}
      className={`relative inline-flex ${className}`}
      aria-describedby={mounted ? id : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") show(260);
      }}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={() => show(0)}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      {children}
      {mounted ? (
        <Portal>
          <span
            ref={panel}
            id={id}
            role="tooltip"
            data-state={state}
            style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
            className="group/tip pointer-events-none z-[var(--z-tooltip)] w-max max-w-64 rounded-lg bg-ink px-3 py-2 text-center text-[length:var(--fs-small)] font-medium leading-snug text-on-primary data-[state=closed]:animate-tip-out data-[state=open]:animate-tip-in"
          >
            {content}
            <span
              aria-hidden="true"
              className="absolute h-2 w-2 rotate-45 rounded-[1px] bg-ink group-data-[side=top]/tip:bottom-0 group-data-[side=top]/tip:left-[var(--arrow-x)] group-data-[side=top]/tip:-translate-x-1/2 group-data-[side=top]/tip:translate-y-1/2 group-data-[side=bottom]/tip:left-[var(--arrow-x)] group-data-[side=bottom]/tip:top-0 group-data-[side=bottom]/tip:-translate-x-1/2 group-data-[side=bottom]/tip:-translate-y-1/2 group-data-[side=left]/tip:right-0 group-data-[side=left]/tip:top-[var(--arrow-y)] group-data-[side=left]/tip:-translate-y-1/2 group-data-[side=left]/tip:translate-x-1/2 group-data-[side=right]/tip:left-0 group-data-[side=right]/tip:top-[var(--arrow-y)] group-data-[side=right]/tip:-translate-x-1/2 group-data-[side=right]/tip:-translate-y-1/2"
            />
          </span>
        </Portal>
      ) : null}
    </span>
  );
}
