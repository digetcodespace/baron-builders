"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { swatchColors } from "@/lib/design/tokens";
import {
  hexToHsv,
  hsvToHex,
  normalizeHex,
  prefersDarkText,
  type Hsv,
} from "./_color";
import { Icon } from "./Icon";
import { Popover } from "./Popover";
import { Tooltip } from "./Tooltip";

export interface ColorPickerProps {
  /** Names what is being colored, for screen readers: "Color for Framing". */
  label: string;
  /** `#rrggbb`, or null when none is chosen yet. */
  value: string | null;
  onChange: (hex: string) => void;
  /** Colors other items already use; they are marked in the grid so a pick can stay unique. */
  usedColors?: string[];
  disabled?: boolean;
}

function swatchName(hex: string | null) {
  if (!hex) return "none";
  return swatchColors.find((c) => c.hex === hex)?.name ?? hex;
}

/** A drag surface that reports a 0–1 position on both axes. */
function useDrag(onMove: (x: number, y: number) => void) {
  const box = useRef<HTMLDivElement>(null);
  const at = (event: ReactPointerEvent) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    onMove(
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    );
  };
  return {
    ref: box,
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      at(event);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) at(event);
    },
  };
}

function Panel({
  value,
  onChange,
  usedColors,
  close,
}: {
  value: string | null;
  onChange: (hex: string) => void;
  usedColors: string[];
  close: () => void;
}) {
  const [hsv, setHsv] = useState<Hsv>(() =>
    hexToHsv(value ?? swatchColors[0].hex),
  );
  const [draft, setDraft] = useState(value ?? "");

  const apply = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setDraft(hex);
    onChange(hex);
  };

  const area = useDrag((x, y) => apply({ ...hsv, s: x, v: 1 - y }));
  const hue = useDrag((x) => apply({ ...hsv, h: x * 360 }));
  const current = value ?? hsvToHex(hsv);

  return (
    <div className="w-[17.5rem]">
      <div
        role="listbox"
        aria-label="Colors"
        className="grid grid-cols-5 gap-2"
      >
        {swatchColors.map((c) => {
          const selected = value === c.hex;
          const used = !selected && usedColors.includes(c.hex);
          return (
            <Tooltip
              key={c.hex}
              content={used ? `${c.name} (used by another)` : c.name}
            >
              <button
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={c.name}
                onClick={() => {
                  onChange(c.hex);
                  setHsv(hexToHsv(c.hex));
                  setDraft(c.hex);
                  close();
                }}
                style={{ backgroundColor: c.hex }}
                className={`relative flex size-9 items-center justify-center rounded-full transition-[scale,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-smooth)] hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? "ring-2 ring-text ring-offset-2 ring-offset-surface" : ""}`}
              >
                {selected ? (
                  <Icon
                    name="check"
                    size={16}
                    className={
                      prefersDarkText(c.hex) ? "text-ink" : "text-on-primary"
                    }
                  />
                ) : null}
                {used ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-surface bg-n-500"
                  />
                ) : null}
              </button>
            </Tooltip>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <p className="py-1 t-small font-semibold text-text">Any color</p>
        <div className="mt-3 space-y-3">
          <div
            {...area}
            role="slider"
            aria-label="Saturation and brightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
            tabIndex={0}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 0.1 : 0.02;
              if (e.key === "ArrowLeft")
                apply({ ...hsv, s: Math.max(0, hsv.s - step) });
              else if (e.key === "ArrowRight")
                apply({ ...hsv, s: Math.min(1, hsv.s + step) });
              else if (e.key === "ArrowUp")
                apply({ ...hsv, v: Math.min(1, hsv.v + step) });
              else if (e.key === "ArrowDown")
                apply({ ...hsv, v: Math.max(0, hsv.v - step) });
              else return;
              e.preventDefault();
            }}
            // The two overlays are the color model itself (white to the pure hue, then to black), not theme colors.
            style={{
              backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }),
              backgroundImage:
                "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
            }}
            className="relative h-32 w-full cursor-crosshair touch-none rounded-[var(--r-md)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              aria-hidden="true"
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
                backgroundColor: current,
              }}
              className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-on-primary shadow-overlay"
            />
          </div>

          <div
            {...hue}
            role="slider"
            aria-label="Hue"
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(hsv.h)}
            tabIndex={0}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 20 : 4;
              if (e.key === "ArrowLeft" || e.key === "ArrowDown")
                apply({ ...hsv, h: (hsv.h - step + 360) % 360 });
              else if (e.key === "ArrowRight" || e.key === "ArrowUp")
                apply({ ...hsv, h: (hsv.h + step) % 360 });
              else return;
              e.preventDefault();
            }}
            style={{
              backgroundImage:
                "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            }}
            className="relative h-3 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              aria-hidden="true"
              style={{
                left: `${(hsv.h / 360) * 100}%`,
                backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }),
              }}
              className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-on-primary shadow-overlay"
            />
          </div>

          <label className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              style={{ backgroundColor: current }}
              className="size-9 shrink-0 rounded-[var(--r-md)] border border-border"
            />
            <span className="sr-only">Hex code</span>
            <input
              value={draft}
              spellCheck={false}
              maxLength={7}
              placeholder="#c41e2a"
              aria-label="Hex code"
              onChange={(e) => {
                setDraft(e.target.value);
                const hex = normalizeHex(e.target.value);
                if (hex) {
                  setHsv(hexToHsv(hex));
                  onChange(hex);
                }
              }}
              className="h-9 min-w-0 flex-1 rounded-[var(--r-md)] border border-border bg-surface px-3 font-mono text-[length:var(--fs-small)] text-text outline-none transition-colors focus:border-primary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Pick a color: 25 ready-made swatches, or any color at all through the "Any color" panel (a
 * saturation and brightness area, a hue slider, and a hex code). Colors other items already use
 * carry a small dot so each can keep its own.
 */
export function ColorPicker({
  label,
  value,
  onChange,
  usedColors = [],
  disabled,
}: ColorPickerProps) {
  // Re-key the panel each time the popover opens so it starts from the saved value.
  const [opens, setOpens] = useState(0);

  return (
    <Popover
      label={label}
      placement="bottom-start"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          disabled={disabled}
          aria-label={`${label}: ${swatchName(value)}`}
          onClick={() => {
            setOpens((n) => n + 1);
            props.onClick();
          }}
          style={value ? { backgroundColor: value } : undefined}
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-[scale,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-smooth)] hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 ${value ? "border-transparent" : "border-dashed border-n-400 bg-n-50"}`}
        >
          {value ? null : <Icon name="plus" size={14} className="text-n-500" />}
        </button>
      )}
    >
      {(close) => (
        <Panel
          key={opens}
          value={value}
          onChange={onChange}
          usedColors={usedColors}
          close={close}
        />
      )}
    </Popover>
  );
}
