"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useApiErrorHandler } from "./useApiErrorHandler";

export function useSignOut() {
  const router = useRouter();
  const handleError = useApiErrorHandler();
  return useCallback(async () => {
    try {
      await apiFetch("/api/auth/sign-out", { method: "POST" });
      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      handleError(error);
    }
  }, [handleError, router]);
}
