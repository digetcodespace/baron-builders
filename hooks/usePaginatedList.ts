"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PageShape<T> {
  items: T[];
  nextCursor: string | null;
}

export interface UsePaginatedListOptions<T> {
  /** Fetch one page. `cursor` is null for the first page. */
  fetchPage: (cursor: string | null) => Promise<PageShape<T>>;
  /** First page prefetched on the server, so above-the-fold lists render without a spinner. */
  initialPage?: PageShape<T>;
  /** Called when a page fails to load; surface it (toast) rather than swallowing it. */
  onError?: (error: unknown, retry: () => void) => void;
}

export interface UsePaginatedList<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  /** Attach to a 1px `<div>` at the bottom of the scrollable container. */
  sentinelRef: (node: HTMLDivElement | null) => void;
  /** Start over from page one (e.g. after a realtime change). */
  reload: () => void;
}

/** The one pagination hook for every list UI. Never fetch a full list up front. */
export function usePaginatedList<T>({ fetchPage, initialPage, onError }: UsePaginatedListOptions<T>): UsePaginatedList<T> {
  const [items, setItems] = useState<T[]>(initialPage?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(initialPage?.nextCursor ?? null);
  const [hasMore, setHasMore] = useState<boolean>(initialPage ? initialPage.nextCursor !== null : true);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef(false);
  const generationRef = useRef(0);
  const loadRef = useRef<(from: string | null, replace: boolean) => Promise<void>>(async () => {});
  const fetchPageRef = useRef(fetchPage);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
    onErrorRef.current = onError;
  });

  const load = useCallback(async (from: string | null, replace: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    const generation = generationRef.current;
    try {
      const page = await fetchPageRef.current(from);
      if (generation !== generationRef.current) return;
      setItems((current) => (replace ? page.items : [...current, ...page.items]));
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
    } catch (error) {
      onErrorRef.current?.(error, () => void loadRef.current(from, replace));
      // Stop the sentinel from hammering a failing endpoint; the retry action resumes.
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    loadRef.current = async (from, replace) => {
      setHasMore(true);
      await load(from, replace);
    };
  }, [load]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const cursorRef = useRef(cursor);
  const hasMoreRef = useRef(hasMore);
  useEffect(() => {
    cursorRef.current = cursor;
    hasMoreRef.current = hasMore;
  });

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && hasMoreRef.current) {
            void load(cursorRef.current, false);
          }
        },
        { rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [load],
  );

  useEffect(() => {
    if (!initialPage) void load(null, true);
    // Mount only: the sentinel drives every later page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = useCallback(() => {
    generationRef.current += 1;
    loadingRef.current = false;
    setHasMore(true);
    void load(null, true);
  }, [load]);

  return { items, isLoading, hasMore, sentinelRef, reload };
}
