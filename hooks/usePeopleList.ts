"use client";

import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { ProfileRow } from "@/lib/data";
import { useApiErrorHandler } from "./useApiErrorHandler";
import { usePaginatedList, type PageShape } from "./usePaginatedList";

/** Everyone with an account, newest first, loaded as you scroll. */
export function usePeopleList() {
  const handleError = useApiErrorHandler();
  const fetchPage = useCallback((cursor: string | null) => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<PageShape<ProfileRow>>(`/api/people${query}`);
  }, []);
  return usePaginatedList<ProfileRow>({ fetchPage, onError: (error, retry) => handleError(error, { retry }) });
}
