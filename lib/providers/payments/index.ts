/**
 * Payments seam. The provider is not decided (Sola Payments is the likely
 * choice; the proposal names Stripe). Everything outside this folder depends
 * on `PaymentProvider`, so choosing one is a single new implementation here.
 */
export interface CreatePaymentRequest {
  /** Our invoice id; the provider echoes it back so webhooks can find the invoice. */
  invoiceId: string;
  amountCents: number;
  currency: "usd";
  method: "card" | "bank_transfer";
  buyerEmail: string;
}

export interface PaymentResult {
  providerReference: string;
  status: "pending" | "succeeded" | "failed";
}

export interface PaymentProvider {
  createPayment(request: CreatePaymentRequest): Promise<PaymentResult>;
  /** Verify and parse an inbound webhook; throws if the signature is invalid. */
  parseWebhook(rawBody: string, headers: Headers): Promise<{ invoiceId: string; status: PaymentResult["status"] }>;
}

export function getPaymentProvider(): PaymentProvider {
  throw new Error("No payment provider is configured yet");
}
