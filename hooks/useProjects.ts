"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { ProjectDetail, ProjectRow } from "@/lib/data";
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

/** One project with its stages, loaded when its drawer opens. Pass null for a new project. */
export function useProjectDetail(projectId: string | null, enabled: boolean) {
  const handleError = useApiErrorHandler();
  const [state, setState] = useState<{ project: ProjectDetail | null; loading: boolean }>({ project: null, loading: false });

  useEffect(() => {
    if (!enabled || !projectId) return;
    let canceled = false;
    const frame = requestAnimationFrame(() => setState({ project: null, loading: true }));
    apiFetch<ProjectDetail>(`/api/projects/${projectId}`)
      .then((project) => {
        if (!canceled) setState({ project, loading: false });
      })
      .catch((error) => {
        if (canceled) return;
        setState({ project: null, loading: false });
        handleError(error);
      });
    return () => {
      canceled = true;
      cancelAnimationFrame(frame);
    };
  }, [enabled, projectId, handleError]);

  return state;
}

export interface StageValues {
  id?: string;
  name: string;
  cutoffDate: string | null;
}

export interface SaveProjectValues {
  projectId?: string;
  name: string;
  stages: StageValues[];
}

/** Save a project and its stages. Field errors come back keyed by field path (`name`, `stages.2.name`, `stages`). */
export function useSaveProject() {
  const handleError = useApiErrorHandler();
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = useCallback(
    async (values: SaveProjectValues): Promise<ProjectDetail | null> => {
      setBusy(true);
      setFieldErrors({});
      try {
        const { projectId, ...body } = values;
        return await apiFetch<ProjectDetail>(projectId ? `/api/projects/${projectId}` : "/api/projects", {
          method: projectId ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
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

  // Stable on purpose: the drawer lists it as an effect dependency.
  const clearErrors = useCallback(() => setFieldErrors({}), []);
  return { submit, busy, fieldErrors, clearErrors };
}
