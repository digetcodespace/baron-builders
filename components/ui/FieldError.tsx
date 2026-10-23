import { Icon } from "./Icon";

/** Inline validation message next to an input. Field errors never go in a toast. */
export function FieldError({ id, message }: { id?: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex animate-expand items-center gap-1.5 t-small text-bad!">
      <Icon name="alert-circle" size={14} />
      {message}
    </p>
  );
}
