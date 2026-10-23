export type DataErrorCode =
  | "not_found"
  | "conflict"
  | "forbidden"
  | "unavailable"
  | "rate_limited"
  | "auth_failed"
  | "unknown";

export class DataError extends Error {
  readonly code: DataErrorCode;

  constructor(code: DataErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DataError";
    this.code = code;
  }
}

interface PostgrestLike {
  code?: string;
  message: string;
}

/** Map a PostgREST/Postgres error to a typed data error. */
export function toDataError(error: PostgrestLike, what: string): DataError {
  switch (error.code) {
    case "PGRST116":
      return new DataError("not_found", `${what} not found`, { cause: error });
    case "23505":
      return new DataError("conflict", `${what} already exists`, { cause: error });
    case "42501":
      return new DataError("forbidden", `Not allowed to access ${what}`, { cause: error });
    case "PGRST301":
    case "08006":
      return new DataError("unavailable", "Database unavailable", { cause: error });
    default:
      return new DataError("unknown", `Could not read ${what}`, { cause: error });
  }
}

interface AuthErrorLike {
  code?: string;
  status?: number;
  message: string;
}

/** Map a Supabase Auth error to a typed data error. */
export function toAuthDataError(error: AuthErrorLike, what: string): DataError {
  const code = error.code ?? "";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) {
    return new DataError("rate_limited", "Too many sign-in attempts", { cause: error });
  }
  if (code === "otp_expired" || code === "invalid_credentials" || code === "validation_failed") {
    return new DataError("auth_failed", `${what} is not valid or has expired`, { cause: error });
  }
  if (code === "email_exists" || code === "user_already_exists") {
    return new DataError("conflict", `${what} already exists`, { cause: error });
  }
  return new DataError("unknown", `Could not complete ${what}`, { cause: error });
}
