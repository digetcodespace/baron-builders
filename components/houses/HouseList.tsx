"use client";

import type { HouseRow } from "@/lib/data";
import { useHousesList } from "@/hooks/useHousesList";
import type { PageShape } from "@/hooks/usePaginatedList";
import { Skeleton } from "@/components/ui";

/** Staff houses list. Receives its first page as a prop; fetches the rest as you scroll. */
export function HouseList({ initialPage }: { initialPage: PageShape<HouseRow> }) {
  const { items, isLoading, hasMore, sentinelRef } = useHousesList(initialPage);

  if (items.length === 0 && !isLoading) {
    return <p className="t-body">No houses yet. Houses appear here once they are imported.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-border rounded-md border border-border bg-surface">
        {items.map((house) => (
          <li key={house.id} className="flex items-center justify-between px-4 py-3">
            <span className="t-ui">Lot {house.lot}</span>
            <span className="t-small">{house.address ?? "No address yet"}</span>
          </li>
        ))}
      </ul>
      {isLoading ? <Skeleton className="mt-3 h-12" /> : null}
      {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
    </div>
  );
}
