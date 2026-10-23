const SIZES = { sm: 16, md: 22, lg: 32 } as const;

/** In-flight action indicator. Layout placeholders use `Skeleton`, never this. */
export function Spinner({ size = "md", className = "" }: { size?: keyof typeof SIZES; className?: string }) {
  const px = SIZES[size];
  return (
    <svg
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      fill="none"
      className={`shrink-0 animate-spin-slow ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
