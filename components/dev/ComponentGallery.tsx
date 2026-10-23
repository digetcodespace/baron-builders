"use client";

import { BrandLogo, Icon } from "@/components/ui";
import { ActionsSection, FeedbackSection } from "./ActionsFeedbackSection";
import { InputsSection } from "./InputsSection";
import { DataSection, NavigationSection, OverlaysSection } from "./OverlaysNavDataSection";

const SECTIONS = [
  { id: "actions", label: "Actions" },
  { id: "inputs", label: "Inputs" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "navigation", label: "Navigation" },
  { id: "data", label: "Data" },
];

/** Every component, live. A build-time reference for the team; it is not part of the product. */
export function ComponentGallery() {
  return (
    <div className="page-wash min-h-dvh">
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-glass backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <BrandLogo height={34} />
          <nav aria-label="Sections" className="flex gap-1 overflow-x-auto">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-md px-3 py-1.5 t-ui text-n-700 transition-colors hover:bg-ink-soft hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12">
        <p className="t-label flex items-center gap-2 text-primary">
          <Icon name="sparkle" size={14} /> Component gallery
        </p>
        <h1 className="t-display mt-3">Built to feel like the brand.</h1>
        <p className="t-lead mt-4 max-w-2xl">
          Every control here is custom: one frame, one motion language, one set of tokens. Click, tab, and type into
          anything.
        </p>
        <ActionsSection />
        <InputsSection />
        <FeedbackSection />
        <OverlaysSection />
        <NavigationSection />
        <DataSection />
      </main>
    </div>
  );
}
