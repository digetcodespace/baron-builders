export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 25;

/** Opaque to callers; encodes the `(created_at DESC, id DESC)` position. */
export type Cursor = string;

export interface Page<T> {
  items: T[];
  nextCursor: Cursor | null;
}

export interface PageParams {
  cursor?: Cursor | null;
  limit?: number;
}

interface CursorParts {
  createdAt: string;
  id: string;
}

export function capLimit(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_PAGE_SIZE);
}

export function encodeCursor(parts: CursorParts): Cursor {
  return Buffer.from(JSON.stringify([parts.createdAt, parts.id])).toString("base64url");
}

export function decodeCursor(cursor: Cursor): CursorParts | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      Array.isArray(parsed) &&
      typeof parsed[0] === "string" &&
      typeof parsed[1] === "string" &&
      !Number.isNaN(Date.parse(parsed[0])) &&
      /^[0-9a-f-]{36}$/i.test(parsed[1])
    ) {
      return { createdAt: parsed[0], id: parsed[1] };
    }
  } catch {
    // A malformed cursor is treated as "no cursor"; the caller restarts at page one.
  }
  return null;
}

/**
 * PostgREST `.or()` filter for rows strictly after the cursor in
 * `(created_at DESC, id DESC)` order. Returns null for the first page.
 */
export function descCursorOrPredicate(cursor: Cursor | null | undefined): string | null {
  if (!cursor) return null;
  const parts = decodeCursor(cursor);
  if (!parts) return null;
  return `created_at.lt.${parts.createdAt},and(created_at.eq.${parts.createdAt},id.lt.${parts.id})`;
}

/**
 * Trim the extra look-ahead row and build the page. Fetch `limit + 1` rows,
 * ordered `created_at DESC, id DESC`, then pass them here.
 */
export function toPage<T extends { created_at: string; id: string }>(rows: T[], limit: number): Page<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
  };
}
