import { cookies } from "next/headers";
import { createUserClient, getProfile, type CookieAdapter } from "@/lib/data";
import { UnauthorizedError, contextLogError, type RequestContext } from "@/lib/services";
import { getRequestId } from "./toErrorResponse";

async function nextCookieAdapter(): Promise<CookieAdapter> {
  const store = await cookies();
  return {
    getAll: () => store.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (list) => {
      try {
        for (const { name, value, options } of list) store.set(name, value, options);
      } catch {
        // Server Components cannot set cookies; the proxy refreshes the session instead.
      }
    },
  };
}

/**
 * Resolve the caller for a route handler or server component. Verifies the
 * session with Supabase (never trusts the cookie alone) and loads the role.
 * Throws `UnauthorizedError` when there is no usable session or no profile.
 */
export async function createRequestContext(req?: Request): Promise<RequestContext> {
  const requestId = req ? getRequestId(req) : crypto.randomUUID();
  const db = createUserClient(await nextCookieAdapter());

  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new UnauthorizedError();

  const profile = await getProfile(db, data.user.id);
  if (!profile) throw new UnauthorizedError("Your account has no access yet");

  return {
    requestId,
    userId: profile.id,
    role: profile.role,
    db,
    logError: contextLogError(requestId, profile.id),
  };
}
