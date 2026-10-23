import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout";
import { requirePortalRole } from "@/lib/http";

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  await requirePortalRole("buyer");
  return (
    <PortalShell portalName="Your home" homeHref="/buyer">
      {children}
    </PortalShell>
  );
}

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";
