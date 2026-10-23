import { ForbiddenError } from "@/lib/services";

/**
 * Block cross-site form posts: a state-changing request must come from this
 * site. Browsers always send `Origin` on POST, so a missing or foreign origin is refused.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) throw new ForbiddenError("Request origin could not be verified");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ForbiddenError("Request origin could not be verified");
  }
  if (originHost !== host) throw new ForbiddenError("Request origin could not be verified");
}
