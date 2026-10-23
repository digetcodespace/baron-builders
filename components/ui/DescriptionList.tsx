import type { ReactNode } from "react";

export interface DescriptionItem {
  term: string;
  value: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /**
   * `ledger` (default): label on the left, value on the right, a dotted rule
   * between rows, like a spec sheet. `grid`: labels stacked over values in columns.
   */
  layout?: "ledger" | "grid";
  columns?: 1 | 2 | 3;
  className?: string;
}

/** Label/value pairs: a house's address, model, status, buyers. */
export function DescriptionList({ items, layout = "ledger", columns = 2, className = "" }: DescriptionListProps) {
  if (layout === "grid") {
    const grid = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }[columns];
    return (
      <dl className={`grid gap-x-8 gap-y-5 ${grid} ${className}`}>
        {items.map((item) => (
          <div key={item.term} className="min-w-0">
            <dt className="t-small">{item.term}</dt>
            <dd className="mt-1 t-ui font-medium">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <dl className={className}>
      {items.map((item, index) => (
        <div
          key={item.term}
          className={`flex items-baseline gap-4 py-3 ${index > 0 ? "border-t border-dashed border-n-200" : ""}`}
        >
          <dt className="t-small shrink-0">{item.term}</dt>
          <dd className="ml-auto min-w-0 text-right t-ui font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
