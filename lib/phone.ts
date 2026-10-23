/**
 * Phone numbers, one set of rules for the browser and the server. Numbers are stored in E.164
 * (`+17325550142`) and shown the way people write them. US numbers are the default: ten digits,
 * with or without a leading 1. Anything typed with a leading `+` is treated as international.
 */

const digitsOf = (input: string) => input.replace(/\D/g, "");

/** `+17325550142` for a complete number, or null while it is missing digits or is not a phone number. */
export function normalizePhone(input: string): string | null {
  const text = input.trim();
  const digits = digitsOf(text);
  if (text.startsWith("+")) {
    // +1 is the US and Canada: exactly ten digits follow. Other countries run 8 to 15 digits in all.
    if (digits.startsWith("1")) return digits.length === 11 ? `+${digits}` : null;
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function isCompletePhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/**
 * The text to show for what has been typed so far: `(732) 555-0142` as digits arrive. A number
 * with a `+` and a country other than the US keeps its digits as typed, grouped by the leading code.
 */
export function formatPhone(input: string): string {
  const text = input.trim();
  const digits = digitsOf(text);
  if (!digits) return text.startsWith("+") ? "+" : "";

  const international = text.startsWith("+") && !digits.startsWith("1");
  if (international) return `+${digits.slice(0, 15)}`;

  // US: drop a leading country 1, then group (AAA) BBB-CCCC.
  const national = (digits.startsWith("1") && (text.startsWith("+") || digits.length > 10) ? digits.slice(1) : digits).slice(0, 10);
  const area = national.slice(0, 3);
  const prefix = national.slice(3, 6);
  const line = national.slice(6, 10);
  if (national.length <= 3) return national.length === 3 ? `(${area}) ` : area.length ? `(${area}` : "";
  if (national.length <= 6) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${line}`;
}
