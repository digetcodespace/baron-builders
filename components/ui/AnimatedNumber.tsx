"use client";

import { useEffect, useState } from "react";

export interface AnimatedNumberProps {
  value: number;
  /** Digits after the decimal point. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Show thousands separators. */
  grouped?: boolean;
  className?: string;
}

function format(value: number, decimals: number, grouped: boolean) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouped,
  }).format(Math.abs(value));
}

/** Each digit is a reel that rolls to its new value. Used for running totals and stats. */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  grouped = true,
  className = "",
}: AnimatedNumberProps) {
  const text = format(value, decimals, grouped);
  const negative = value < 0;
  // Reels mount at 0, then roll to their digit on the next frame so first paint animates too.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span
      className={`inline-flex items-baseline tabular-nums ${className}`}
      aria-label={`${prefix}${negative ? "-" : ""}${text}${suffix}`}
      role="text"
    >
      <span aria-hidden="true">{negative ? "-" : ""}{prefix}</span>
      {text.split("").map((char, index) => {
        const fromEnd = text.length - index;
        if (!/\d/.test(char)) {
          return (
            <span key={`s-${fromEnd}`} aria-hidden="true">
              {char}
            </span>
          );
        }
        const digit = Number(char);
        return (
          <span
            key={`d-${fromEnd}`}
            aria-hidden="true"
            className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none"
          >
            <span
              className="flex flex-col transition-transform duration-[var(--dur-slow)] ease-[var(--ease-spring)]"
              style={{ transform: `translateY(${settled ? -digit : 0}em)` }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n} className="block h-[1em] leading-none">
                  {n}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      <span aria-hidden="true">{suffix}</span>
    </span>
  );
}
