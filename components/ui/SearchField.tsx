"use client";

import { useEffect, useRef, useState } from "react";
import { FieldFrame } from "./_FieldFrame";
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
    <FieldFrame focused={focused} className={`flex h-11 items-center gap-2 px-3.5 ${className}`}>
      <Icon
        name="search"
        size={18}
        className="relative text-n-500 transition-colors duration-[var(--dur-base)] group-focus-within/box:text-primary"
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
        className="relative h-full min-w-0 flex-1 bg-transparent text-[length:var(--fs-ui)] font-medium outline-none placeholder:font-normal placeholder:text-n-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {text ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setText("");
            schedule("", true);
          }}
          className="relative flex h-6 w-6 animate-pop-in items-center justify-center rounded-full text-n-500 transition-colors hover:bg-ink-soft hover:text-text"
        >
          <Icon name="x" size={14} />
        </button>
      ) : null}
    </FieldFrame>
  );
}
