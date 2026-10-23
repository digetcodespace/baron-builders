"use client";

import { useCallback, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { HouseRow } from "@/lib/data";
import { useRealtime } from "@/components/providers";
import { useApiErrorHandler } from "./useApiErrorHandler";
import { usePaginatedList, type PageShape } from "./usePaginatedList";

/** Houses list with server-prefetched first page, cursor paging, and live updates. */
export function useHousesList(initialPage?: PageShape<HouseRow>) {
  const handleError = useApiErrorHandler();
  const { subscribe } = useRealtime();

  const fetchPage = useCallback((cursor: string | null) => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<PageShape<HouseRow>>(`/api/houses${query}`);
  }, []);

  const list = usePaginatedList<HouseRow>({
    fetchPage,
    initialPage,
    onError: (error, retry) => handleError(error, { retry }),
  });

  const { reload } = list;
  useEffect(() => subscribe("houses", () => reload()), [subscribe, reload]);

  return list;
}
