import type { ReactNode } from "react";

/** Layout helpers for the component gallery. Not part of the product UI. */
export function Section({ id, title, blurb, children }: { id: string; title: string; blurb: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-12 first:border-0">
      <h2 className="t-h2">{title}</h2>
      <p className="mt-1.5 mb-8 max-w-prose t-small">{blurb}</p>
      <div className="space-y-10">{children}</div>
    </section>
  );
}

export function Specimen({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="t-h4">{name}</h3>
        {note ? <p className="t-small">{note}</p> : null}
      </div>
      <div className="rounded-lg border border-border bg-surface p-6 shadow-low">{children}</div>
    </div>
  );
}

export function Row({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>;
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid gap-6 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>{children}</div>;
}
