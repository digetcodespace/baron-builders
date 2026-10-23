"use client";

import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";

export interface EmailFieldProps extends Omit<TextFieldProps, "type" | "value" | "defaultValue" | "onChange" | "leadingIcon" | "prefix"> {
  value: string;
  onChange: (value: string) => void;
}

const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * A labeled email input. It brings up the email keyboard on phones, turns off auto-capitalization
 * and spell-check, drops stray spaces as you type or paste, and says so next to the field if the
 * address is left unfinished.
 */
export function EmailField({ value, onChange, error, onBlur, ...rest }: EmailFieldProps) {
  const [touched, setTouched] = useState(false);
  const unfinished = touched && value !== "" && !LOOKS_LIKE_EMAIL.test(value);

  return (
    <TextField
      {...rest}
      type="email"
      inputMode="email"
      autoComplete="email"
      autoCapitalize="none"
      spellCheck={false}
      leadingIcon="mail"
      value={value}
      error={error ?? (unfinished ? "Enter a full address, like name@company.com" : null)}
      onChange={(event) => onChange(event.target.value.replace(/\s/g, ""))}
      onBlur={(event) => {
        setTouched(true);
        onBlur?.(event);
      }}
    />
  );
}
