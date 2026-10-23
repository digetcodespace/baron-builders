"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { logError } from "@/lib/observability";
import { Button } from "@/components/ui";

interface Props {
  children: ReactNode;
  /** Shown above the retry button. */
  title?: string;
}

interface State {
  error: (Error & { digest?: string }) | null;
}

/** In-tree boundary: captures to the error tracker and shows the digest for support. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, { componentStack: info.componentStack });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div role="alert" className="rounded-md border border-border bg-surface p-6">
        <h2 className="t-h4">{this.props.title ?? "This part of the page failed to load"}</h2>
        {error.digest ? <p className="mt-1 t-small">Reference: {error.digest}</p> : null}
        <Button className="mt-4" onClick={() => this.setState({ error: null })}>
          Try again
        </Button>
      </div>
    );
  }
}
