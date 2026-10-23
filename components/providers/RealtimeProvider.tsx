"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import { subscribeToTable, type RealtimeTable, type TableChange } from "@/lib/data/client";

interface RealtimeContextValue {
  /** Returns an unsubscribe. A no-op when Supabase is not configured. */
  subscribe: (table: RealtimeTable, onChange: (change: TableChange) => void, filter?: string) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

/**
 * The one place realtime channels are opened. Components and hooks subscribe
 * through `useRealtime()`; they never open a channel directly.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<RealtimeContextValue>(
    () => ({
      subscribe: (table, onChange, filter) =>
        isSupabaseConfigured() ? subscribeToTable(table, onChange, filter) : () => {},
    }),
    [],
  );
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error("useRealtime must be used inside <RealtimeProvider>");
  return ctx;
}
