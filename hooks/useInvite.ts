"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { HouseRow, VendorRow } from "@/lib/data";
import { useApiErrorHandler } from "./useApiErrorHandler";
import type { PageShape } from "./usePaginatedList";

export interface InviteFormValues {
  email: string;
  fullName: string;
  role: "staff" | "buyer" | "vendor";
  houseId?: string;
  vendorId?: string;
}

export interface InviteOutcome {
  userId: string;
  created: boolean;
  emailSent: boolean;
  signInUrl: string;
}

/** Submit an invitation. Field errors come back keyed by field name for the form to show. */
export function useInvite() {
  const handleError = useApiErrorHandler();
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = useCallback(
    async (values: InviteFormValues): Promise<InviteOutcome | null> => {
      setBusy(true);
      setFieldErrors({});
      try {
        return await apiFetch<InviteOutcome>("/api/invites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(values),
        });
      } catch (error) {
        if (error instanceof ApiError && error.field) {
          setFieldErrors({ [error.field]: error.message });
        } else {
          handleError(error);
        }
        return null;
      } finally {
        setBusy(false);
      }
    },
    [handleError],
  );

  // Stable on purpose: dialogs list it as an effect dependency, and a new function each render would reset their form on every keystroke.
  const clearErrors = useCallback(() => setFieldErrors({}), []);

  return { submit, busy, fieldErrors, clearErrors };
}

/** The houses and vendors an invitation can point at, loaded when the dialog opens. */
export function useInviteTargets(enabled: boolean) {
  const handleError = useApiErrorHandler();
  const [state, setState] = useState<{ houses: HouseRow[]; vendors: VendorRow[]; loading: boolean }>({
    houses: [],
    vendors: [],
    loading: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let canceled = false;
    const frame = requestAnimationFrame(() => setState((s) => ({ ...s, loading: true })));
    Promise.all([
      apiFetch<PageShape<HouseRow>>("/api/houses?limit=100"),
      apiFetch<PageShape<VendorRow>>("/api/vendors?limit=100"),
    ])
      .then(([houses, vendors]) => {
        if (!canceled) setState({ houses: houses.items, vendors: vendors.items, loading: false });
      })
      .catch((error) => {
        if (canceled) return;
        setState((s) => ({ ...s, loading: false }));
        handleError(error);
      });
    return () => {
      canceled = true;
      cancelAnimationFrame(frame);
    };
  }, [enabled, handleError]);

  return state;
}
