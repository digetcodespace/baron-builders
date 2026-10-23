/** Color math for the picker. Hex is always `#rrggbb`, lowercase. */

export interface Hsv {
  /** 0–360 */
  h: number;
  /** 0–1 */
  s: number;
  /** 0–1 */
  v: number;
}

const HEX = /^#?([0-9a-f]{6})$/i;

/** `#C41E2A`, `c41e2a` → `#c41e2a`; anything else → null. */
export function normalizeHex(input: string): string | null {
  const match = HEX.exec(input.trim());
  return match ? `#${match[1].toLowerCase()}` : null;
}

export function hexToHsv(hex: string): Hsv {
  const n = normalizeHex(hex) ?? "#000000";
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const part = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${part(f(5))}${part(f(3))}${part(f(1))}`;
}

/** Which of two text colors reads on this background: true for dark text. */
export function prefersDarkText(hex: string): boolean {
  const n = normalizeHex(hex) ?? "#000000";
  const lin = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5) > 0.5;
}
