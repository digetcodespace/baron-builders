"use client";

/**
 * Browser barrel. The single browser Supabase client and the table-typed
 * realtime wrappers. Components never import this; only
 * `components/providers/RealtimeProvider.tsx` does.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/config";

let browserClient: SupabaseClient | undefined;

export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const env = publicEnv();
    browserClient = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  }
  return browserClient;
}

export type RealtimeTable = "houses" | "house_buyers" | "audit_log" | "selections" | "vendor_item_progress" | "sheet_signatures";

export interface TableChange {
  table: RealtimeTable;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  newRow: Record<string, unknown> | null;
  oldRow: Record<string, unknown> | null;
}

/** Subscribe to one table's changes, optionally filtered (e.g. `house_id=eq.<id>`). Returns an unsubscribe. */
export function subscribeToTable(
  table: RealtimeTable,
  onChange: (change: TableChange) => void,
  filter?: string,
): () => void {
  const client = getBrowserClient();
  const channel = client
    .channel(`table:${table}:${filter ?? "all"}:${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, ...(filter ? { filter } : {}) },
      (payload) =>
        onChange({
          table,
          eventType: payload.eventType,
          newRow: (payload.new as Record<string, unknown>) ?? null,
          oldRow: (payload.old as Record<string, unknown>) ?? null,
        }),
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
