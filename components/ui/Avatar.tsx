const SIZES = {
  sm: "h-7 w-7 text-[length:var(--fs-label)]",
  md: "h-9 w-9 text-[length:var(--fs-small)]",
  lg: "h-12 w-12 text-[length:var(--fs-ui)]",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Stable tone per name, so a person keeps the same avatar color everywhere. */
const TONES = ["bg-primary text-on-primary", "bg-ink text-on-primary", "bg-n-700 text-on-primary", "bg-primary-deep text-on-primary", "bg-n-500 text-on-primary"];
function toneFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

export interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      role="img"
      aria-label={name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-extrabold ring-2 ring-surface ${SIZES[size]} ${toneFor(name)} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarGroup({ names, max = 4, size = "md" }: { names: string[]; max?: number; size?: keyof typeof SIZES }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="inline-flex -space-x-2">
      {shown.map((name) => (
        <Avatar key={name} name={name} size={size} />
      ))}
      {extra > 0 ? (
        <span
          className={`inline-flex items-center justify-center rounded-full bg-ink-soft font-semibold text-n-700 ring-2 ring-surface ${SIZES[size]}`}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
