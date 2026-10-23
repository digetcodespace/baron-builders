"use client";

import { useEffect } from "react";
import { logError } from "@/lib/observability";
import { Button } from "@/components/ui";

/** Shared body for every segment `error.tsx`: captures once, shows the digest, offers a retry. */
export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error, { digest: error.digest });
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-lg p-6">
      <h1 className="t-h3">Something went wrong</h1>
      <p className="mt-2 t-body">We could not load this page. Try again, and contact the office if it keeps happening.</p>
      {error.digest ? <p className="mt-2 t-small">Reference: {error.digest}</p> : null}
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
