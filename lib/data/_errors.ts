export type DataErrorCode = "not_found" | "conflict" | "forbidden" | "unavailable" | "unknown";

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
