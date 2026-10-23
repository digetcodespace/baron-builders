/** The only loading texture for layout placeholders. Never hand-roll `animate-pulse`. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`shimmer rounded-md ${className}`} />;
}
