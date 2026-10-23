import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout";
import { requirePortalRole } from "@/lib/http";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  await requirePortalRole("vendor");
  return (
    <PortalShell portalName="Vendor" homeHref="/vendor">
      {children}
    </PortalShell>
  );
}

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";
