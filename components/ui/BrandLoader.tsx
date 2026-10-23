/**
 * The towers build themselves, window by window. The page-level loader for
 * long waits; short waits use `Spinner`, layout placeholders use `Skeleton`.
 */
export function BrandLoader({ label = "Loading", size = 72 }: { label?: string; size?: number }) {
  const windows = [
    { x: 11, y: 36, d: 600 },
    { x: 11, y: 44, d: 760 },
    { x: 11, y: 52, d: 920 },
    { x: 33, y: 22, d: 1080 },
    { x: 33, y: 30, d: 1240 },
    { x: 33, y: 38, d: 1400 },
    { x: 33, y: 46, d: 1560 },
    { x: 33, y: 54, d: 1720 },
  ];
  return (
    <div role="status" aria-label={label} className="inline-flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect
          x="6"
          y="58"
          width="52"
          height="3"
          rx="1"
          className="fill-ink"
          style={{ transformOrigin: "left", animation: "tower-rise 700ms var(--ease-out) both" }}
        />
        <rect
          x="8"
          y="30"
          width="19"
          height="28"
          rx="1.5"
          className="fill-primary-deep"
          style={{ transformOrigin: "bottom", animation: "tower-rise 900ms var(--ease-spring) 200ms both" }}
        />
        <rect
          x="29"
          y="14"
          width="27"
          height="44"
          rx="1.5"
          className="fill-primary"
          style={{ transformOrigin: "bottom", animation: "tower-rise 1000ms var(--ease-spring) 400ms both" }}
        />
        {windows.map((w) => (
          <rect
            key={`${w.x}-${w.y}`}
            x={w.x}
            y={w.y}
            width="5"
            height="4"
            rx="0.8"
            className="fill-on-primary animate-twinkle"
            style={{ animationDelay: `${w.d}ms` }}
          />
        ))}
        {windows.slice(3).map((w) => (
          <rect
            key={`r-${w.x}-${w.y}`}
            x={w.x + 11}
            y={w.y}
            width="5"
            height="4"
            rx="0.8"
            className="fill-on-primary animate-twinkle"
            style={{ animationDelay: `${w.d + 300}ms` }}
          />
        ))}
      </svg>
      <span className="t-label text-muted">{label}</span>
    </div>
  );
}
