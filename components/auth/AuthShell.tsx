import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui";
import { TowersArt } from "./TowersArt";

/**
 * Sign-in frame. Large screens get a calm dark panel (logo, one line of welcome, and the
 * towers standing on a ground line that runs the full width) beside the form. Phones get just
 * the logo above the form.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <aside data-towers-host="" className="hidden min-h-0 flex-col bg-ink text-on-primary md:flex">
        <div className="flex flex-1 flex-col justify-between px-12 pt-12">
          <BrandLogo tone="reverse" height={40} className="self-start" />
          <div className="max-w-sm py-10">
            <h1 className="t-display text-balance">Come on in.</h1>
            <p className="mt-4 text-[length:var(--fs-lead)] leading-relaxed text-balance text-n-400">Your selections, from contract to signed.</p>
          </div>
        </div>
        <div className="flex h-[min(42vh,22rem)] items-end justify-center px-8">
          <TowersArt className="h-full w-auto max-w-full" />
        </div>
        <div className="h-2 w-full bg-n-800" />
      </aside>
      <main className="page-wash flex flex-col px-6 py-8 sm:px-12">
        <BrandLogo height={36} className="self-start md:hidden" />
        <div className="mx-auto flex w-full max-w-[22rem] flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
