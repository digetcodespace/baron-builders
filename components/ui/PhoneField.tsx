"use client";

import { useState } from "react";
import { formatPhone, isCompletePhone, normalizePhone } from "@/lib/phone";
import { TextField, type TextFieldProps } from "./TextField";

export interface PhoneFieldProps extends Omit<TextFieldProps, "type" | "value" | "defaultValue" | "onChange" | "leadingIcon" | "prefix"> {
  /** What the parent holds: `+17325550142` once complete, or the partial text while typing. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * A labeled phone input. It opens the number pad on phones, formats as you type
 * (`(732) 555-0142`), hands the parent `+17325550142` once the number is complete, and says so
 * next to the field if it is left unfinished. Numbers with a leading `+` are taken as international.
 */
export function PhoneField({ value, onChange, error, onBlur, hint, ...rest }: PhoneFieldProps) {
  const [touched, setTouched] = useState(false);
  const incomplete = touched && value.trim() !== "" && !isCompletePhone(value);

  return (
    <TextField
      {...rest}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      leadingIcon="phone"
      value={formatPhone(value)}
      error={error ?? (incomplete ? "Enter the full number, like (732) 555-0142" : null)}
      hint={hint}
      onChange={(event) => {
        const shown = formatPhone(event.target.value);
        onChange(normalizePhone(shown) ?? shown);
      }}
      onBlur={(event) => {
        setTouched(true);
        onBlur?.(event);
      }}
    />
  );
}
