"use client";

import { useCallback, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { HouseTypeRow } from "@/lib/data";
import { useApiErrorHandler } from "./useApiErrorHandler";
import { usePaginatedList, type PageShape } from "./usePaginatedList";

/** One project's house types, newest first, loaded as you scroll. */
export function useHouseTypesList(projectId: string) {
  const handleError = useApiErrorHandler();
  const fetchPage = useCallback(
    (cursor: string | null) => {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      return apiFetch<PageShape<HouseTypeRow>>(`/api/projects/${projectId}/house-types${query}`);
    },
    [projectId],
  );
  return usePaginatedList<HouseTypeRow>({ fetchPage, onError: (error, retry) => handleError(error, { retry }) });
}

/** Create, rename, and delete house types. A bad name comes back as a field error for the form to show. */
export function useHouseTypeActions(projectId: string) {
  const handleError = useApiErrorHandler();
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const run = useCallback(
    async <T,>(request: () => Promise<T>): Promise<T | null> => {
      setBusy(true);
      setFieldErrors({});
      try {
        return await request();
      } catch (error) {
        if (error instanceof ApiError && error.field) setFieldErrors({ [error.field]: error.message });
        else handleError(error);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [handleError],
  );

  const create = useCallback(
    (name: string) =>
      run(() =>
        apiFetch<HouseTypeRow>(`/api/projects/${projectId}/house-types`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        }),
      ),
    [projectId, run],
  );

  const rename = useCallback(
    (houseTypeId: string, name: string) =>
      run(() =>
        apiFetch<HouseTypeRow>(`/api/house-types/${houseTypeId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        }),
      ),
    [run],
  );

  /** Resolves true when the type was removed. A refusal (it has houses) shows as a toast. */
  const remove = useCallback(
    async (houseTypeId: string) => {
      const done = await run(async () => {
        await apiFetch<unknown>(`/api/house-types/${houseTypeId}`, { method: "DELETE" });
        return true;
      });
      return done === true;
    },
    [run],
  );

  // Stable on purpose: dialogs list it as an effect dependency.
  const clearErrors = useCallback(() => setFieldErrors({}), []);
  return { create, rename, remove, busy, fieldErrors, clearErrors };
}
