export interface SparklineProps {
  values: number[];
  /** CSS color for the line. Defaults to the brand red. */
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

/** A tiny trend line. It draws itself in once, with a soft fill underneath. */
export function Sparkline({ values, color = "var(--primary)", width = 96, height = 36, className = "" }: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;
  const points = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (width - pad * 2),
    height - pad - ((v - min) / span) * (height - pad * 2),
  ]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fill = `${line} L${points[points.length - 1][0].toFixed(1)} ${height} L${points[0][0].toFixed(1)} ${height} Z`;
  const [lx, ly] = points[points.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true" className={className}>
      <path d={fill} style={{ fill: color, opacity: 0.1 }} />
      <path
        d={line}
        pathLength={1}
        strokeDasharray={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        className="animate-draw"
        style={{ stroke: color }}
      />
      <circle cx={lx} cy={ly} r={3} style={{ fill: color }} className="animate-chip-pop" />
    </svg>
  );
}
