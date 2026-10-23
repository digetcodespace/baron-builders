"use client";

import { useEffect } from "react";
import { logError } from "@/lib/observability";

/** Last-resort boundary: renders its own <html> because the root layout failed. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div role="alert" className="mx-auto max-w-lg p-6">
          <h1 className="t-h3">Something went wrong</h1>
          {error.digest ? <p className="t-small">Reference: {error.digest}</p> : null}
          <button type="button" onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-on-primary">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
