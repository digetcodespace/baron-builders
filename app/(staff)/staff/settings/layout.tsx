import type { ReactNode } from "react";
import { SectionNav } from "@/components/layout";
import { SETTINGS_GROUPS } from "@/components/settings/nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[13.5rem_minmax(0,1fr)] md:gap-10">
      <SectionNav label="Settings" groups={SETTINGS_GROUPS} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
