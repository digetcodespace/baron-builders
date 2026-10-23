import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout";
import { requirePortalRole } from "@/lib/http";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  await requirePortalRole("staff");
  return (
    <PortalShell portalName="Staff" homeHref="/staff">
      {children}
    </PortalShell>
  );
}

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";
