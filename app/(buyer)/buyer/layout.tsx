import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { requirePortalRole } from "@/lib/http";
import { getMyProfile } from "@/lib/services";

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";

const NAV = [{ label: "My home", href: "/buyer", icon: "home" as const }];

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const ctx = await requirePortalRole("buyer");
  const me = await getMyProfile(ctx);
  return (
    <AppShell nav={NAV} homeHref="/buyer" user={{ name: me.full_name || me.email, email: me.email, roleLabel: "Homebuyer" }}>
      {children}
    </AppShell>
  );
}
