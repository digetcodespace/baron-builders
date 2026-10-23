"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon, IconButton, TONES, TONE_TILE, toneStyle, type Tone } from "@/components/ui";

export interface ToastOptions {
  tone?: Tone;
  /** `null` makes the toast sticky (retryable failures must wait for the user). Default 5000. */
  durationMs?: number | null;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastData extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  addToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_MS = 5000;

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const tone = toast.tone ?? "info";
  const duration = toast.durationMs === undefined ? DEFAULT_MS : toast.durationMs;
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const startedAt = useRef(0);

  const dismiss = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (duration === null || paused) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(dismiss, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [duration, paused, dismiss]);

  return (
    <div
      className={`pointer-events-auto grid transition-[grid-template-rows,margin] duration-[var(--dur-base)] ease-[var(--ease-out)] ${leaving ? "-mb-2 grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
    >
      <div className={leaving ? "min-h-0 overflow-hidden" : "min-h-0"}>
        <div
          role="status"
          style={toneStyle(tone)}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          className={`relative overflow-hidden rounded-2xl border border-border bg-surface ${leaving ? "animate-toast-out" : "animate-toast-in"}`}
        >
          <div className="flex items-center gap-3 py-3 pl-3 pr-2.5">
            <span className={`${TONE_TILE} h-10 w-10 animate-chip-pop`}>
              <Icon name={TONES[tone].icon} size={20} />
            </span>
            <p className="min-w-0 flex-1 t-ui font-medium">{toast.message}</p>
            {toast.actionLabel && toast.onAction ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  toast.onAction?.();
                  dismiss();
                }}
              >
                {toast.actionLabel}
              </Button>
            ) : null}
            <IconButton label="Dismiss" icon="x" size="sm" onClick={dismiss} />
          </div>
          {duration !== null ? (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left animate-countdown bg-[var(--tone)] opacity-60"
              style={{ animationDuration: `${duration}ms`, animationPlayState: paused ? "paused" : "running" }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** The one toast surface. Do not add another toast library. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-4), { id, message, ...options }]);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[var(--z-toast)] flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-2 max-md:bottom-24"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={remove} />
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
