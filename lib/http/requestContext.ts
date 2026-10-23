import { cookies } from "next/headers";
import { publicEnv } from "@/lib/config";
import { createUserClient, getProfile, type CookieAdapter, type Db, type UserRole } from "@/lib/data";
import { BadRequestError, UnauthorizedError, contextLogError, type PublicContext, type RequestContext } from "@/lib/services";
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

const ROLES: readonly UserRole[] = ["staff", "buyer", "vendor"];

async function resolveRole(db: Db, userId: string): Promise<UserRole | null> {
  const { data: claims } = await db.auth.getClaims();
  const claimed = claims?.claims?.user_role;
  if (typeof claimed === "string" && (ROLES as readonly string[]).includes(claimed)) {
    return claimed as UserRole;
  }
  return (await getProfile(db, userId))?.role ?? null;
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

  // The role rides in the signed token (`user_role`, added by the auth hook), so no
  // database lookup is needed. Tokens issued before the hook existed fall back to it.
  const role = await resolveRole(db, data.user.id);
  if (!role) throw new UnauthorizedError("Your account has no access yet");

  return {
    requestId,
    userId: data.user.id,
    role,
    db,
    siteUrl: publicEnv().NEXT_PUBLIC_SITE_URL,
    logError: contextLogError(requestId, data.user.id),
  };
}

/**
 * Context for people who are not signed in yet (asking for or entering a code).
 * The client still carries the cookie adapter, so a successful code check can
 * write the session cookies.
 */
export async function createPublicContext(req: Request): Promise<PublicContext> {
  const requestId = getRequestId(req);
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    requestId,
    db: createUserClient(await nextCookieAdapter()),
    ip: forwarded || req.headers.get("x-real-ip") || "unknown",
    logError: contextLogError(requestId, null),
  };
}

/** Read a JSON request body; a missing or malformed body is a client error, not a crash. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new BadRequestError("The request body must be valid JSON");
  }
}
