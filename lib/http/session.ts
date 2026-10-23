import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { createUserClient } from "@/lib/data";

const PROTECTED_PREFIXES = ["/staff", "/buyer", "/vendor"];

/**
 * Called by `proxy.ts` on every request: refreshes the Supabase session cookie
 * and sends signed-out visitors away from the portals. Role checks happen in
 * each portal layout (`requirePortalRole`), not here.
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
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (isProtected && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}
