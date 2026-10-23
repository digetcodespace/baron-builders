"use client";

import { useCallback } from "react";
import { ApiError, formatRetryAfter } from "@/lib/api";
import { usePaymentBanner, useToast } from "@/components/providers";

export interface HandleErrorOptions {
  /** Replays the failed request (offered on 429 and on generic failures). */
  retry?: () => void;
  /** Called with the field name and message when the server names a field; render it with `<FieldError>`. */
  onFieldError?: (field: string, message: string) => void;
}

/**
 * Surfaces a user-triggered error by one mechanical rule:
 * field → inline (caller renders it), 429 → sticky retry toast,
 * 402 → payment banner, anything else → toast with the server message.
 */
export function useApiErrorHandler() {
  const { addToast } = useToast();
  const { showPaymentBanner } = usePaymentBanner();

  return useCallback(
    (error: unknown, options: HandleErrorOptions = {}) => {
      if (!(error instanceof ApiError)) {
        addToast("Something went wrong", { tone: "bad", durationMs: null, actionLabel: options.retry ? "Retry" : undefined, onAction: options.retry });
        return;
      }
      if (error.field && options.onFieldError) {
        options.onFieldError(error.field, error.message);
        return;
      }
      if (error.status === 429) {
        addToast(`Too many requests. ${formatRetryAfter(error.retryAfter)}`, {
          tone: "warn",
          durationMs: null,
          actionLabel: options.retry ? "Retry" : undefined,
          onAction: options.retry,
        });
        return;
      }
      if (error.status === 402) {
        showPaymentBanner(error.message);
        return;
      }
      addToast(error.message, {
        tone: "bad",
        durationMs: options.retry ? null : undefined,
        actionLabel: options.retry ? "Retry" : undefined,
        onAction: options.retry,
      });
    },
    [addToast, showPaymentBanner],
  );
}
