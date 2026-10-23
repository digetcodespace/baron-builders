"use client";

import { useCallback, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { ProjectRow } from "@/lib/data";
import { useApiErrorHandler } from "./useApiErrorHandler";
import { usePaginatedList, type PageShape } from "./usePaginatedList";

/** Projects, newest first, loaded as you scroll. */
export function useProjectsList() {
  const handleError = useApiErrorHandler();
  const fetchPage = useCallback((cursor: string | null) => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<PageShape<ProjectRow>>(`/api/projects${query}`);
  }, []);
  return usePaginatedList<ProjectRow>({ fetchPage, onError: (error, retry) => handleError(error, { retry }) });
}

/** Create a project. A bad name comes back as a field error for the form to show. */
export function useCreateProject() {
  const handleError = useApiErrorHandler();
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = useCallback(
    async (name: string): Promise<ProjectRow | null> => {
      setBusy(true);
      setFieldErrors({});
      try {
        return await apiFetch<ProjectRow>("/api/projects", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name }),
        });
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

  // Stable on purpose: the dialog lists it as an effect dependency.
  const clearErrors = useCallback(() => setFieldErrors({}), []);
  return { submit, busy, fieldErrors, clearErrors };
}
