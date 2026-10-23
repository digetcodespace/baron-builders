"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { AUTH_RESEND_SECONDS } from "@/lib/config";
import { useApiErrorHandler } from "./useApiErrorHandler";

export type SignInStep = "email" | "code";

/**
 * The two-step sign-in: ask for a code, then enter it. Field problems land
 * next to the field (email or code); everything else goes through the shared
 * error handler. A successful code sends the person home, and `/` routes them
 * to their own portal.
 */
export function useSignIn(initialEmail = "") {
  const router = useRouter();
  const handleError = useApiErrorHandler();
  const [step, setStep] = useState<SignInStep>("email");
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  /** Bump to clear the code boxes after a wrong code. */
  const [attempt, setAttempt] = useState(0);
  const emailRef = useRef(email);
  // Retry actions call the latest version of these through refs, so a callback never refers to itself.
  const requestRef = useRef<(address: string) => Promise<void>>(async () => {});
  const verifyRef = useRef<(code: string) => Promise<void>>(async () => {});

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const requestCode = useCallback(
    async (address: string) => {
      setBusy(true);
      setEmailError(null);
      try {
        await apiFetch("/api/auth/request-code", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: address }),
        });
        emailRef.current = address;
        setEmail(address);
        setCodeError(null);
        setAttempt((a) => a + 1);
        setCooldown(AUTH_RESEND_SECONDS);
        setStep("code");
      } catch (error) {
        handleError(error, {
          retry: () => void requestRef.current(address),
          onFieldError: (field, message) => {
            if (field === "email") setEmailError(message);
          },
        });
      } finally {
        setBusy(false);
      }
    },
    [handleError],
  );

  const verify = useCallback(
    async (code: string) => {
      setBusy(true);
      setCodeError(null);
      try {
        await apiFetch("/api/auth/verify-code", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: emailRef.current, code }),
        });
        router.replace("/");
        router.refresh();
      } catch (error) {
        if (error instanceof ApiError && error.field === "code") {
          setCodeError(error.message);
          setAttempt((a) => a + 1);
        } else {
          handleError(error, { retry: () => void verifyRef.current(code) });
          setAttempt((a) => a + 1);
        }
        setBusy(false);
      }
    },
    [handleError, router],
  );

  useEffect(() => {
    requestRef.current = requestCode;
    verifyRef.current = verify;
  }, [requestCode, verify]);

  const backToEmail = useCallback(() => {
    setStep("email");
    setCodeError(null);
  }, []);

  return { step, email, emailError, codeError, busy, cooldown, attempt, requestCode, verify, backToEmail };
}
