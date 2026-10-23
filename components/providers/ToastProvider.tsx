"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui";

type Tone = "info" | "ok" | "warn" | "bad";

export interface ToastOptions {
  tone?: Tone;
  /** `null` makes the toast sticky (retryable failures must wait for the user). Default 5000. */
  durationMs?: number | null;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  addToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_CLASS: Record<Tone, string> = {
  info: "bg-info-bg text-info",
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  bad: "bg-bad-bg text-bad",
};

/** The one toast surface. Do not add another toast library. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, ...options }]);
      const duration = options.durationMs === undefined ? 5000 : options.durationMs;
      if (duration !== null) window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[var(--z-toast)] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-md px-4 py-3 shadow-high t-ui ${TONE_CLASS[toast.tone ?? "info"]}`}
          >
            <span className="flex-1">{toast.message}</span>
            {toast.actionLabel && toast.onAction ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  toast.onAction?.();
                  dismiss(toast.id);
                }}
              >
                {toast.actionLabel}
              </Button>
            ) : null}
            <Button size="sm" variant="ghost" onClick={() => dismiss(toast.id)}>
              Dismiss
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
