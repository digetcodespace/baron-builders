/**
 * Client-side error parser. Every `/api/*` response error is read through
 * `parseApiError(res)`: no `.json().catch()` boilerplate, no hand-reading
 * `Retry-After` or `requestId`. `ApiError` is a real `Error`, so
 * `instanceof Error` works.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;
  /** Seconds, from `Retry-After` (429 only). */
  readonly retryAfter?: number;
  readonly requestId?: string;

  constructor(init: {
    status: number;
    code: string;
    message: string;
    field?: string;
    retryAfter?: number;
    requestId?: string;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.code = init.code;
    this.field = init.field;
    this.retryAfter = init.retryAfter;
    this.requestId = init.requestId;
  }
}

interface ErrorBodyShape {
  error?: { code?: unknown; message?: unknown; field?: unknown; requestId?: unknown };
}

export async function parseApiError(res: Response): Promise<ApiError> {
  let body: ErrorBodyShape = {};
  try {
    body = (await res.json()) as ErrorBodyShape;
  } catch {
    // Non-JSON error body (a gateway page, for example): fall back to the status.
  }
  const e = body.error ?? {};
  const retryHeader = Number(res.headers.get("retry-after"));
  return new ApiError({
    status: res.status,
    code: typeof e.code === "string" ? e.code : "unknown",
    message: typeof e.message === "string" ? e.message : "Something went wrong",
    field: typeof e.field === "string" ? e.field : undefined,
    retryAfter: Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : undefined,
    requestId:
      typeof e.requestId === "string" ? e.requestId : (res.headers.get("x-request-id") ?? undefined),
  });
}

export function formatRetryAfter(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "Try again in a moment.";
  if (seconds < 60) return `Try again in ${seconds} second${seconds === 1 ? "" : "s"}.`;
  const minutes = Math.ceil(seconds / 60);
  return `Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}
