import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { requirePortalRole } from "@/lib/http";
import { getMyProfile } from "@/lib/services";

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";

const NAV = [
  { label: "Dashboard", href: "/staff", icon: "grid" as const },
  { label: "Settings", href: "/staff/settings", icon: "sliders" as const },
];

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const ctx = await requirePortalRole("staff");
  const me = await getMyProfile(ctx);
  return (
    <AppShell
      nav={NAV}
      homeHref="/staff"
      user={{ name: me.full_name || me.email, email: me.email, roleLabel: "Baron Builders staff" }}
    >
      {children}
    </AppShell>
  );
}
