import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui";
import { PERSONAS, type Persona } from "./personas";
import { TowersArt } from "./TowersArt";

/**
 * Sign-in frame. Both columns share one structure (a logo-height row on top, then a middle that
 * is centered on the same line) so the welcome and the form always line up. The towers are
 * anchored to the bottom of the dark panel and take no space in the layout. Phones get only the
 * logo above the form.
 */
export function AuthShell({ persona, children }: { persona: Persona; children: ReactNode }) {
  const copy = PERSONAS[persona];
  return (
    <div className="grid min-h-dvh flex-1 md:grid-cols-2">
      <aside data-towers-host="" className="relative hidden flex-col overflow-hidden bg-ink px-14 pt-12 text-on-primary md:flex">
        <BrandLogo tone="reverse" height={40} className="self-start" />
        <div className="flex flex-1 items-center pb-[18vh]">
          <div className="max-w-md">
            <h1 className="t-display text-balance">{copy.headline}</h1>
            <p className="mt-4 text-[length:var(--fs-lead)] leading-snug text-balance text-n-400">{copy.line}</p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[30vh] items-end justify-center px-10">
          <TowersArt className="pointer-events-auto h-full w-auto max-w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-n-800" />
      </aside>
      <main className="page-wash flex flex-col px-6 pt-8 sm:px-14 md:pt-12">
        <BrandLogo height={36} className="self-start md:invisible" />
        <div className="mx-auto flex w-full max-w-[22rem] flex-1 items-center pb-[18vh] md:pb-[18vh]">
          <div className="w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
