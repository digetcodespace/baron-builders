import { Skeleton } from "@/components/ui";

/** Shared `loading.tsx` body for the portals. */
export function PortalLoading() {
  return (
    <div aria-busy="true" className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
      <Skeleton className="h-12" />
    </div>
  );
}
