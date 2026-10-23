/** The only loading texture for layout placeholders. Never hand-roll `animate-pulse`. */
export function Skeleton({ className = "", circle = false }: { className?: string; circle?: boolean }) {
  return <div aria-hidden="true" className={`shimmer ${circle ? "rounded-full" : "rounded-md"} ${className}`} />;
}
