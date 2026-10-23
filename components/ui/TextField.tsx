"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { FIELD_CONTROL, FieldShell } from "./_FieldShell";
import { Icon, type IconName } from "./Icon";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  leadingIcon?: IconName;
  /** Static text before the value, e.g. "$". Keeps the label raised. */
  prefix?: string;
  /** Static text after the value, e.g. "sq ft". */
  suffix?: string;
  trailing?: ReactNode;
}

/** The one labeled text input. Never hand-roll a label + input pair. */
export function TextField({
  label,
  hint,
  error,
  leadingIcon,
  prefix,
  suffix,
  trailing,
  id,
  className,
  value,
  defaultValue,
  disabled,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const [uncontrolledFilled, setUncontrolledFilled] = useState(Boolean(defaultValue));
  const filled =
    value !== undefined ? String(value).length > 0 : uncontrolledFilled;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      disabled={disabled}
      focused={focused}
      filled={filled || Boolean(prefix)}
      className={className}
      leading={leadingIcon ? <Icon name={leadingIcon} size={18} /> : undefined}
      trailing={
        <>
          {suffix ? <span className="self-end pb-3 pr-1.5 t-small">{suffix}</span> : null}
          {trailing}
        </>
      }
    >
      <div className="flex items-end">
        {prefix ? <span className="select-none pb-2.5 pl-4 pt-6 text-[length:var(--fs-ui)] leading-[1.45] font-medium text-n-600">{prefix}</span> : null}
        <input
          id={fieldId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={`${FIELD_CONTROL} ${prefix ? "!pl-1" : ""}`}
          onChange={(event) => {
            setUncontrolledFilled(event.target.value.length > 0);
            onChange?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}
