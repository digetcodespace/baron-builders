import type { UserRole } from "@/lib/data";

/** Where each role lives. Pure data, safe to import from the proxy. */
export const PORTAL_HOME: Record<UserRole, string> = {
  staff: "/staff",
  buyer: "/buyer",
  vendor: "/vendor",
};

/** The role a path belongs to, or null for public paths. */
export function portalRoleForPath(path: string): UserRole | null {
  for (const role of Object.keys(PORTAL_HOME) as UserRole[]) {
    const home = PORTAL_HOME[role];
    if (path === home || path.startsWith(`${home}/`)) return role;
  }
  return null;
}
