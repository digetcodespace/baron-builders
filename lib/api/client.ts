import { parseApiError } from "./parseError";

/** Typed JSON fetch for `/api/*`. Throws `ApiError` on any non-2xx response. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { accept: "application/json", ...init?.headers },
  });
  if (!res.ok) throw await parseApiError(res);
  // A 204 (a delete) has no body to read.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
