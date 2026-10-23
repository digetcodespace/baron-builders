import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui";
import { TowersArt } from "./TowersArt";

/**
 * The frame around sign-in: a dark brand panel on large screens (the logo, a
 * welcome, and the towers with their windows lighting up) and the form beside it.
 * On phones the panel gives way to a simple logo header.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 md:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-on-primary md:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-[34rem] w-[34rem] rounded-full [background:radial-gradient(closest-side,color-mix(in_srgb,var(--primary)_28%,transparent),transparent)]"
        />
        <BrandLogo tone="reverse" height={44} className="relative" />
        <div className="relative max-w-md">
          <h1 className="t-display">Come on in.</h1>
          <p className="mt-5 text-[length:var(--fs-lead)] leading-relaxed text-n-300">
            One place for every selection, from contract to signed and paid.
          </p>
        </div>
        <TowersArt className="absolute bottom-0 right-0 w-[70%] max-w-lg" />
        <span />
      </aside>
      <main className="page-wash flex flex-col px-6 py-10 sm:px-12">
        <BrandLogo height={40} className="md:hidden" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
