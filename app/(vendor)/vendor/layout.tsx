import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { requirePortalRole } from "@/lib/http";
import { getMyProfile } from "@/lib/services";

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";

const NAV = [{ label: "Waiting for you", href: "/vendor", icon: "clipboard" as const }];

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const ctx = await requirePortalRole("vendor");
  const me = await getMyProfile(ctx);
  return (
    <AppShell nav={NAV} homeHref="/vendor" user={{ name: me.full_name || me.email, email: me.email, roleLabel: "Vendor" }}>
      {children}
    </AppShell>
  );
}
