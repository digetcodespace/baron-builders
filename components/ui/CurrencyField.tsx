"use client";

import { useState, type ReactNode } from "react";
import { TextField } from "./TextField";

export interface CurrencyFieldProps {
  label: string;
  /** Integer cents, or null when empty. */
  value: number | null;
  onChange: (cents: number | null) => void;
  hint?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

function toCents(text: string): number | null {
  const cleaned = text.replace(/[^0-9.]/g, "");
  if (cleaned === "" || cleaned === ".") return null;
  const [whole, fraction = ""] = cleaned.split(".");
  return Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
}

function toText(cents: number | null): string {
  if (cents === null) return "";
  return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Dollar amount input that stores integer cents, formats on blur, and never accepts junk. */
export function CurrencyField({ label, value, onChange, hint, error, disabled, className }: CurrencyFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <TextField
      label={label}
      prefix="$"
      inputMode="decimal"
      value={draft ?? toText(value)}
      hint={hint}
      error={error}
      disabled={disabled}
      className={className}
      onFocus={() => setDraft(value === null ? "" : (value / 100).toFixed(2).replace(/\.00$/, ""))}
      onChange={(event) => {
        const text = event.target.value.replace(/[^0-9.]/g, "");
        if ((text.match(/\./g) ?? []).length > 1) return;
        if (/\.\d{3,}$/.test(text)) return;
        setDraft(text);
        onChange(toCents(text));
      }}
      onBlur={() => setDraft(null)}
    />
  );
}
