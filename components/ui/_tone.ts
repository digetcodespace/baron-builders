import type { CSSProperties } from "react";
import type { IconName } from "./Icon";

export type Tone = "info" | "warn" | "bad" | "ok";

/** Each tone is one CSS variable; every tint, border, and icon color is mixed from it, so tones stay consistent. */
export const TONES: Record<Tone, { color: string; icon: IconName }> = {
  info: { color: "var(--info)", icon: "info" },
  warn: { color: "var(--warn)", icon: "alert-triangle" },
  bad: { color: "var(--bad)", icon: "alert-circle" },
  ok: { color: "var(--ok)", icon: "check-circle" },
};

export function toneStyle(tone: Tone): CSSProperties {
  return { ["--tone" as string]: TONES[tone].color };
}

/** The tinted rounded tile that holds a tone's icon. Shared by banners and toasts. */
export const TONE_TILE =
  "flex shrink-0 items-center justify-center rounded-[var(--r-md)] [corner-shape:squircle] border border-[color-mix(in_srgb,var(--tone)_24%,var(--surface))] bg-[color-mix(in_srgb,var(--tone)_12%,var(--surface))] text-[var(--tone)]";
