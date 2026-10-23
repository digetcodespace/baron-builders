"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/** Run `handler` when Escape is pressed while `enabled`. */
export function useEscape(handler: () => void, enabled = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") ref.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled]);
}

/** Run `handler` on a pointer press outside every given element. */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled = true,
) {
  const handlerRef = useRef(handler);
  const refsRef = useRef(refs);
  useEffect(() => {
    handlerRef.current = handler;
    refsRef.current = refs;
  });
  useEffect(() => {
    if (!enabled) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && refsRef.current.some((r) => r.current?.contains(target))) return;
      handlerRef.current();
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [enabled]);
}

let scrollLocks = 0;

/** Stop the page behind an overlay from scrolling. Safe to nest. */
export function useScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    scrollLocks += 1;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = previous;
    };
  }, [enabled]);
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Keep Tab inside `ref` while `enabled`, focus it on open, and restore focus on close. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const container = ref.current;
    if (!container) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = container.querySelector<HTMLElement>("[data-autofocus]") ?? container.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? container).focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const head = nodes[0];
      const tail = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault();
        head.focus();
      }
    };
    container.addEventListener("keydown", onKey);
    return () => {
      container.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [ref, enabled]);
}

/** A value that is either controlled by its parent or held here. */
export function useControllable<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [inner, setInner] = useState<T>(initial);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : inner;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInner(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, set];
}

/**
 * Keeps an element mounted long enough to play its exit animation.
 * `state` is "open" while visible and "closed" while leaving.
 */
export function usePresence(open: boolean, exitMs = 200) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closed">(open ? "open" : "closed");
  useEffect(() => {
    let frame = 0;
    let timer = 0;
    if (open) {
      frame = requestAnimationFrame(() => {
        setMounted(true);
        setState("open");
      });
    } else {
      frame = requestAnimationFrame(() => setState("closed"));
      timer = window.setTimeout(() => setMounted(false), exitMs);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [open, exitMs]);
  return { mounted: mounted || open, state };
}

export type Placement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

/**
 * Position `floating` beside `anchor` (fixed, flips above when there is no room
 * below, stays inside the viewport). Writes styles straight to the element so
 * scrolling never re-renders React.
 */
export function useAnchoredPosition(
  anchor: RefObject<HTMLElement | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
  options: { placement?: Placement; offset?: number; matchWidth?: boolean } = {},
) {
  const { placement = "bottom-start", offset = 8, matchWidth = false } = options;
  useEffect(() => {
    if (!open) return;
    // Deliberate imperative DOM writes: positioning must not re-render React on every scroll frame.
    /* eslint-disable react-hooks/immutability */
    const place = () => {
      const a = anchor.current?.getBoundingClientRect();
      const f = floating.current;
      if (!a || !f) return;
      if (matchWidth) f.style.minWidth = `${a.width}px`;
      const height = f.offsetHeight;
      const width = f.offsetWidth;
      const prefersTop = placement.startsWith("top");
      let top = prefersTop ? a.top - offset - height : a.bottom + offset;
      let side: "top" | "bottom" = prefersTop ? "top" : "bottom";
      if (!prefersTop && top + height > window.innerHeight - 8 && a.top - offset - height > 8) {
        top = a.top - offset - height;
        side = "top";
      } else if (prefersTop && top < 8 && a.bottom + offset + height < window.innerHeight - 8) {
        top = a.bottom + offset;
        side = "bottom";
      }
      let left = placement.endsWith("end") ? a.right - width : a.left;
      left = Math.min(Math.max(left, 8), Math.max(8, window.innerWidth - width - 8));
      f.style.top = `${Math.round(top)}px`;
      f.style.left = `${Math.round(left)}px`;
      f.style.transformOrigin = `${side === "top" ? "bottom" : "top"} ${placement.endsWith("end") ? "right" : "left"}`;
      f.dataset.side = side;
      f.style.visibility = "visible";
    };
    /* eslint-enable react-hooks/immutability */
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, floating, open, placement, offset, matchWidth]);
}

/**
 * True in the browser, false while rendering on the server. Reads synchronously
 * (no effect), so a portal's children exist in the same commit that opens it.
 */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
