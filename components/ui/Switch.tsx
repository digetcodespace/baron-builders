"use client";

import { useId, type ReactNode } from "react";
import { useControllable } from "./_hooks";

export interface SwitchProps {
  label: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** On/off toggle (a yes/no add-on). The knob stretches as it travels, then settles. */
export function Switch({ label, description, checked, defaultChecked, onChange, disabled, name, className = "" }: SwitchProps) {
  const id = useId();
  const [on, setOn] = useControllable<boolean>(checked, defaultChecked ?? false, onChange);
  return (
    <div className={`flex items-start gap-3 ${disabled ? "opacity-50" : ""} ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${id}-label`}
        disabled={disabled}
        onClick={() => setOn(!on)}
        className="group/switch relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full bg-n-300 shadow-[var(--shadow-inset)] transition-colors duration-[var(--dur-base)] ease-[var(--ease-out)] aria-checked:bg-primary disabled:cursor-not-allowed"
      >
        <span
          aria-hidden="true"
          className={`absolute left-0.5 top-0.5 h-5 rounded-full bg-surface shadow-high transition-[transform,translate,scale,rotate,width] duration-[var(--dur-base)] ease-[var(--ease-spring)] group-active/switch:w-6 ${on ? "w-5 translate-x-5 group-active/switch:translate-x-4" : "w-5 translate-x-0"}`}
        />
      </button>
      {name ? <input type="hidden" name={name} value={on ? "on" : "off"} /> : null}
      <label htmlFor={id} id={`${id}-label`} className="min-w-0 cursor-pointer">
        <span className="block t-ui text-text">{label}</span>
        {description ? <span className="mt-0.5 block t-small">{description}</span> : null}
      </label>
    </div>
  );
}
