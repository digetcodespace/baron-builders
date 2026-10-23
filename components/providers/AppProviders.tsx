"use client";

import type { ReactNode } from "react";
import { PaymentBannerProvider } from "./PaymentBannerProvider";
import { RealtimeProvider } from "./RealtimeProvider";
import { ToastProvider } from "./ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PaymentBannerProvider>
        <RealtimeProvider>{children}</RealtimeProvider>
      </PaymentBannerProvider>
    </ToastProvider>
  );
}
