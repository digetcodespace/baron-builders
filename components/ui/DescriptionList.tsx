import type { ReactNode } from "react";

export interface DescriptionItem {
  term: string;
  value: ReactNode;
}

/** Label/value pairs: a house's address, model, status, buyers. */
export function DescriptionList({ items, columns = 1, className = "" }: { items: DescriptionItem[]; columns?: 1 | 2 | 3; className?: string }) {
  const grid = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }[columns];
  return (
    <dl className={`grid gap-x-8 gap-y-4 ${grid} ${className}`}>
      {items.map((item) => (
        <div key={item.term} className="min-w-0">
          <dt className="t-label text-n-500">{item.term}</dt>
          <dd className="mt-1 t-ui">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
