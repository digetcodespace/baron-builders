import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export interface PortalShellProps {
  portalName: string;
  homeHref: string;
  children: ReactNode;
}

/** Frame shared by the three portals: brand header on top, content below. */
export function PortalShell({ portalName, homeHref, children }: PortalShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={homeHref} aria-label={`Baron Builders ${portalName} home`}>
            <Image src="/brand/baron-logo.svg" alt="Baron Builders" width={140} height={48} unoptimized priority />
          </Link>
          <span className="t-label text-muted">{portalName}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
