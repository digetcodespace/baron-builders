"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export interface SearchFieldProps {
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  /** Wait this long after typing stops before calling `onSearch`. */
  debounceMs?: number;
  className?: string;
  "aria-label"?: string;
}

/** Compact search box with a clear button. Calls `onSearch` after a short pause in typing. */
export function SearchField({
  value,
  onSearch,
  placeholder = "Search",
  debounceMs = 250,
  className = "",
  "aria-label": ariaLabel = "Search",
}: SearchFieldProps) {
  const [text, setText] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const callback = useRef(onSearch);
  useEffect(() => {
    callback.current = onSearch;
  });

  const schedule = (next: string, immediate = false) => {
    window.clearTimeout(timer.current);
    if (immediate) callback.current(next);
    else timer.current = window.setTimeout(() => callback.current(next), debounceMs);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div
      data-focused={focused || undefined}
      className={`group/search relative flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 shadow-[var(--shadow-inset)] transition-[border-color,box-shadow,width] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-n-300 data-[focused]:border-primary-line data-[focused]:shadow-[var(--focus-ring)] ${className}`}
    >
      <Icon
        name="search"
        size={18}
        className="text-n-500 transition-colors group-data-[focused]/search:text-primary"
      />
      <input
        type="search"
        value={text}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => {
          setText(event.target.value);
          schedule(event.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter") schedule(text, true);
          if (event.key === "Escape" && text) {
            setText("");
            schedule("", true);
          }
        }}
        className="h-full min-w-0 flex-1 bg-transparent t-ui outline-none placeholder:text-n-400 focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
      />
      {text ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setText("");
            schedule("", true);
          }}
          className="flex h-6 w-6 animate-pop-in items-center justify-center rounded-full text-n-500 transition-colors hover:bg-ink-soft hover:text-text"
        >
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </div>
  );
}
