"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, Icon, IconButton, type IconName } from "@/components/ui";

type Tone = "info" | "ok" | "warn" | "bad";

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

const TONES: Record<Tone, { icon: IconName; accent: string; bar: string }> = {
  info: { icon: "info", accent: "text-info", bar: "bg-info" },
  ok: { icon: "check-circle", accent: "text-ok", bar: "bg-ok" },
  warn: { icon: "alert-triangle", accent: "text-warn", bar: "bg-warn" },
  bad: { icon: "alert-circle", accent: "text-bad", bar: "bg-bad" },
};

const DEFAULT_MS = 5000;

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const tone = TONES[toast.tone ?? "info"];
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
      className={`grid pointer-events-auto transition-[grid-template-rows,margin] duration-[var(--dur-base)] ease-[var(--ease-out)] ${leaving ? "-mb-2 grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
    >
    <div className={leaving ? "min-h-0 overflow-hidden" : "min-h-0"}>
    <div
      role="status"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={`relative overflow-hidden rounded-lg border border-border bg-surface shadow-overlay ${leaving ? "animate-toast-out" : "animate-toast-in"}`}
    >
      <div className="flex items-start gap-3 py-3.5 pl-4 pr-2">
        <Icon name={tone.icon} size={20} className={`mt-0.5 ${tone.accent}`} />
        <p className="min-w-0 flex-1 pt-0.5 t-ui">{toast.message}</p>
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
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left animate-countdown ${tone.bar}`}
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
