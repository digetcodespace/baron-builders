import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import type { UserRole } from "@/lib/data";
import { UnauthorizedError, type RequestContext } from "@/lib/services";
import { createRequestContext } from "./requestContext";

export const PORTAL_HOME: Record<UserRole, string> = {
  staff: "/staff",
  buyer: "/buyer",
  vendor: "/vendor",
};

/** Send the visitor to their own portal, or to sign-in if they have no session. */
export async function redirectToPortal(): Promise<never> {
  if (!isSupabaseConfigured()) redirect("/sign-in");
  let ctx: RequestContext;
  try {
    ctx = await createRequestContext();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  redirect(PORTAL_HOME[ctx.role]);
}

/**
 * Page and layout guard: returns the caller's context if they hold `role`,
 * otherwise redirects (to sign-in, or to their own portal). Each portal's
 * layout calls this once, so a buyer can never render a staff page.
 */
export async function requirePortalRole(role: UserRole): Promise<RequestContext> {
  if (!isSupabaseConfigured()) redirect("/sign-in");

  let ctx: RequestContext;
  try {
    ctx = await createRequestContext();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  if (ctx.role !== role) redirect(PORTAL_HOME[ctx.role]);
  return ctx;
}
