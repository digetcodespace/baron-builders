import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createUserClient, type UserRole } from "@/lib/data";
import { PORTAL_HOME, portalRoleForPath } from "./portals";

const ROLES: readonly string[] = ["staff", "buyer", "vendor"];

/**
 * Called by `proxy.ts` on every request. Refreshes the Supabase session cookie
 * and does the cheap, instant part of access control from the signed token:
 * signed-out visitors go to sign-in, and a person in the wrong portal (or on
 * sign-in while already signed in) is redirected to their own home. The page
 * layouts still check the role again (`requirePortalRole`), so this is a
 * convenience and a first gate, never the only one.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const db = createUserClient({
    getAll: () => request.cookies.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (list) => {
      for (const { name, value } of list) request.cookies.set(name, value);
      response = NextResponse.next({ request });
      for (const { name, value, options } of list) response.cookies.set(name, value, options);
    },
  });

  const { data } = await db.auth.getUser();
  const path = request.nextUrl.pathname;
  const portalRole = portalRoleForPath(path);

  const redirectTo = (target: string) => {
    const url = request.nextUrl.clone();
    url.pathname = target;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Keep any refreshed session cookies on the redirect too.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!data.user) return portalRole ? redirectTo("/sign-in") : response;

  const { data: claims } = await db.auth.getClaims();
  const claimed = claims?.claims?.user_role;
  const role = typeof claimed === "string" && ROLES.includes(claimed) ? (claimed as UserRole) : null;
  if (!role) return response; // Older token without the claim: the page layouts decide.

  if (portalRole && portalRole !== role) return redirectTo(PORTAL_HOME[role]);
  if (path === "/sign-in") return redirectTo(PORTAL_HOME[role]);
  return response;
}
