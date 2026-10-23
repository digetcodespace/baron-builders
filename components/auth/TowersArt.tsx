/**
 * The two towers from the logo, drawn large, with their windows lighting one by
 * one. Decorative only: hidden from assistive tech and from reduced-motion users'
 * attention (the global reduced-motion rule flattens the twinkle).
 */
export function TowersArt({ className = "" }: { className?: string }) {
  const lowWindows = Array.from({ length: 5 }, (_, row) => Array.from({ length: 3 }, (_, col) => ({ x: 28 + col * 24, y: 70 + row * 22, i: row * 3 + col })));
  const tallWindows = Array.from({ length: 8 }, (_, row) => Array.from({ length: 4 }, (_, col) => ({ x: 130 + col * 24, y: 28 + row * 22, i: row * 4 + col })));
  return (
    <svg viewBox="0 0 260 200" fill="none" aria-hidden="true" className={className}>
      <rect x="14" y="188" width="236" height="6" rx="2" className="fill-n-800" />
      <rect x="16" y="56" width="92" height="132" rx="4" className="fill-primary-deep" />
      <rect x="116" y="8" width="118" height="180" rx="4" className="fill-primary" />
      {lowWindows.flat().map((w) => (
        <rect
          key={`l-${w.i}`}
          x={w.x}
          y={w.y}
          width="14"
          height="12"
          rx="2"
          className="animate-twinkle fill-on-primary"
          style={{ animationDelay: `${(w.i * 370) % 2600}ms`, animationDuration: `${2200 + (w.i % 5) * 360}ms` }}
        />
      ))}
      {tallWindows.flat().map((w) => (
        <rect
          key={`t-${w.i}`}
          x={w.x}
          y={w.y}
          width="14"
          height="12"
          rx="2"
          className="animate-twinkle fill-on-primary"
          style={{ animationDelay: `${(w.i * 290) % 3100}ms`, animationDuration: `${2400 + (w.i % 7) * 300}ms` }}
        />
      ))}
    </svg>
  );
}
