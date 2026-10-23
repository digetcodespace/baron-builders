import { parseApiError } from "./parseError";

/** Typed JSON fetch for `/api/*`. Throws `ApiError` on any non-2xx response. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { accept: "application/json", ...init?.headers },
  });
  if (!res.ok) throw await parseApiError(res);
  return (await res.json()) as T;
}
