"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "./_hooks";

/** Render into `document.body` so overlays are never clipped by an ancestor's overflow. */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(children, document.body);
}
