/**
 * The only place limits are defined or enforced. Today the store is
 * per-process memory behind `RateLimitStore`; swap in a shared store (Redis)
 * by implementing the interface, with no change to callers.
 *
 * Fail-open: if the store throws, the request proceeds and a warning is
 * logged. This is an abuse guardrail, not an authorization boundary.
 */
import { logWarn } from "@/lib/observability";

export class RateLimitError extends Error {
  readonly status = 429;
  readonly code = "rate_limited";
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super("Too many requests. Try again shortly.");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

interface LimitSpec {
  /** Maximum calls per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

const SPECS = {
  "houses-read": { limit: 120, windowSeconds: 60 },
  "audit-write": { limit: 300, windowSeconds: 60 },
  "email-send": { limit: 20, windowSeconds: 60 },
  "otp-request": { limit: 5, windowSeconds: 600 },
  "otp-verify": { limit: 10, windowSeconds: 600 },
  invite: { limit: 30, windowSeconds: 3600 },
  "people-read": { limit: 120, windowSeconds: 60 },
} as const satisfies Record<string, LimitSpec>;

export type LimiterName = keyof typeof SPECS;

export interface RateLimitStore {
  /** Count one hit in the window and return the running count and seconds until reset. */
  hit(key: string, windowSeconds: number): Promise<{ count: number; resetInSeconds: number }>;
}

class MemoryStore implements RateLimitStore {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowSeconds: number) {
    const now = Date.now();
    const existing = this.windows.get(key);
    if (!existing || existing.resetAt <= now) {
      this.windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      return { count: 1, resetInSeconds: windowSeconds };
    }
    existing.count += 1;
    return { count: existing.count, resetInSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
}

let store: RateLimitStore = new MemoryStore();

/** For tests and for installing a shared store at startup. */
export function setRateLimitStore(next: RateLimitStore): void {
  store = next;
}

/**
 * Call once near the top of a service. `identifier` is `ctx.userId` for
 * authenticated paths; pre-login paths pass the email and IP instead.
 */
export async function enforceRateLimit(name: LimiterName, identifier: string): Promise<void> {
  const spec: LimitSpec = SPECS[name];
  let result: { count: number; resetInSeconds: number };
  try {
    result = await store.hit(`${name}:${identifier}`, spec.windowSeconds);
  } catch (error) {
    logWarn("rate limit store unavailable; failing open", {
      limiter: name,
      reason: error instanceof Error ? error.message : String(error),
    });
    return;
  }
  if (result.count > spec.limit) throw new RateLimitError(result.resetInSeconds);
}
