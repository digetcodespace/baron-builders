"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Banner } from "@/components/ui";

interface PaymentBannerContextValue {
  /** Show the one "payment required" banner (the 402 flow). */
  showPaymentBanner: (message?: string) => void;
}

const PaymentBannerContext = createContext<PaymentBannerContextValue | null>(null);

export function PaymentBannerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const showPaymentBanner = useCallback((text?: string) => {
    setMessage(text ?? "Payment is required to continue.");
  }, []);
  const value = useMemo(() => ({ showPaymentBanner }), [showPaymentBanner]);

  return (
    <PaymentBannerContext.Provider value={value}>
      {message ? (
        <div className="sticky top-0 z-[var(--z-banner)] p-2">
          <Banner tone="warn" onDismiss={() => setMessage(null)}>
            {message}
          </Banner>
        </div>
      ) : null}
      {children}
    </PaymentBannerContext.Provider>
  );
}

export function usePaymentBanner(): PaymentBannerContextValue {
  const ctx = useContext(PaymentBannerContext);
  if (!ctx) throw new Error("usePaymentBanner must be used inside <PaymentBannerProvider>");
  return ctx;
}
