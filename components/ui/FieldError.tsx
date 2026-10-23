/** Inline validation message next to an input. Field errors never go in a toast. */
export function FieldError({ id, message }: { id?: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 t-small text-bad!">
      {message}
    </p>
  );
}
