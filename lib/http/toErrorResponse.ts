import { NextResponse } from "next/server";
import { DataError } from "@/lib/data";
import { logError } from "@/lib/observability";
import { RateLimitError, ServiceError } from "@/lib/services";

export interface ErrorBody {
  error: {
    code: string;
    message: string;
    field?: string;
    requestId: string;
  };
}

export function getRequestId(req: Request): string {
  return req.headers.get("x-request-id") ?? crypto.randomUUID();
}

function respond(status: number, body: ErrorBody["error"], extraHeaders: Record<string, string> = {}) {
  return NextResponse.json({ error: body } satisfies ErrorBody, {
    status,
    headers: { "x-request-id": body.requestId, ...extraHeaders },
  });
}

/**
 * The one mapper from thrown errors to HTTP. Routes always
 * `catch (err) { return toErrorResponse(err, req); }`; never build an ad hoc
 * `{ error }` response with a status.
 */
export function toErrorResponse(err: unknown, req: Request): NextResponse {
  const requestId = getRequestId(req);

  if (err instanceof RateLimitError) {
    return respond(
      429,
      { code: err.code, message: err.message, requestId },
      { "retry-after": String(err.retryAfter) },
    );
  }

  if (err instanceof ServiceError) {
    return respond(err.status, { code: err.code, message: err.message, field: err.field, requestId });
  }

  if (err instanceof DataError) {
    switch (err.code) {
      case "not_found":
        return respond(404, { code: "not_found", message: "Not found", requestId });
      case "conflict":
        return respond(409, { code: "conflict", message: err.message, requestId });
      case "forbidden":
        return respond(403, { code: "forbidden", message: "You do not have access to this", requestId });
      default:
        break;
    }
  }

  // Unknown or unavailable: never leak internals to the browser.
  logError(err, { requestId, path: new URL(req.url).pathname });
  return respond(500, { code: "internal", message: "Something went wrong", requestId });
}
