"use client";

import { useEffect, useMemo, useRef } from "react";

interface Win {
  x: number;
  y: number;
  /** Resting brightness: most windows are dim, a few are lit. */
  rest: number;
  /** A handful breathe slowly so the scene is never fully still. */
  breathe: boolean;
  delay: number;
}

const W = 18;
const H = 14;
const GAP_X = 10;
const GAP_Y = 10;

/** Window grid for one tower. Brightness is fixed per position, so server and browser render the same scene. */
function grid(x0: number, y0: number, cols: number, rows: number, seed: number): Win[] {
  const out: Win[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = (r * 7 + c * 13 + seed * 5) % 11;
      out.push({
        x: x0 + c * (W + GAP_X),
        y: y0 + r * (H + GAP_Y),
        rest: n < 3 ? 0.9 : 0.2,
        breathe: n === 3 && (r + c) % 2 === 0,
        delay: (r * 3 + c * 5) % 7,
      });
    }
  }
  return out;
}

/**
 * The two towers from the logo, standing on a ground line. At rest most windows
 * are dim, a few are lit, and a few breathe. Move the pointer over the scene and
 * the windows near it light up, then settle back when it leaves.
 */
export function TowersArt({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const low = useMemo(() => grid(95, 171, 3, 5, 1), []);
  const tall = useMemo(() => grid(267, 90, 4, 8, 2), []);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const rects = Array.from(el.querySelectorAll<SVGRectElement>("[data-win]"));
    let frame = 0;
    let pending: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const box = el.getBoundingClientRect();
      const scale = 480 / box.width;
      const px = (pending.clientX - box.left) * scale;
      const py = (pending.clientY - box.top) * scale;
      for (const rect of rects) {
        const cx = Number(rect.dataset.cx);
        const cy = Number(rect.dataset.cy);
        const d = Math.hypot(cx - px, cy - py);
        const glow = Math.max(0, 1 - d / 120);
        const rest = Number(rect.dataset.rest);
        rect.style.opacity = String(Math.max(rest, 0.15 + glow * 0.85));
      }
    };
    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      pending = null;
      for (const rect of rects) rect.style.opacity = rect.dataset.rest ?? "";
    };

    // The scene is small, so listen on the whole panel: the lights follow the pointer wherever it is.
    const host = el.closest("[data-towers-host]") ?? el;
    host.addEventListener("pointermove", onMove as EventListener);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove as EventListener);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const windows = (list: Win[], prefix: string) =>
    list.map((w, i) => (
      <rect
        key={`${prefix}-${i}`}
        data-win=""
        data-cx={w.x + W / 2}
        data-cy={w.y + H / 2}
        data-rest={w.rest}
        x={w.x}
        y={w.y}
        width={W}
        height={H}
        rx="3"
        className={`fill-on-primary transition-opacity duration-[600ms] ease-[var(--ease-smooth)] ${w.breathe ? "animate-twinkle" : ""}`}
        style={{ opacity: w.rest, animationDelay: w.breathe ? `${w.delay * 450}ms` : undefined, animationDuration: w.breathe ? "4.5s" : undefined }}
      />
    ));

  return (
    <svg ref={svg} viewBox="0 0 480 300" fill="none" aria-hidden="true" className={className} preserveAspectRatio="xMidYMax meet">
      <rect x="64" y="152" width="136" height="148" rx="6" className="fill-primary-deep" />
      <rect x="220" y="62" width="196" height="238" rx="6" className="fill-primary" />
      {windows(low, "low")}
      {windows(tall, "tall")}
    </svg>
  );
}
