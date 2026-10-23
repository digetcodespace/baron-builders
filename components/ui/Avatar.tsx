const SIZES = {
  sm: "h-7 w-7 text-[length:var(--fs-label)] [--r-av:9px]",
  md: "h-9 w-9 text-[length:var(--fs-small)] [--r-av:12px]",
  lg: "h-12 w-12 text-[length:var(--fs-ui)] [--r-av:16px]",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/**
 * A stable tint per name, so a person keeps the same monogram everywhere. Soft
 * tinted tiles with a strong initial, never solid dark blobs.
 */
const TINTS = [
  "bg-[color-mix(in_srgb,var(--primary)_13%,var(--surface))] text-primary-hover border-[color-mix(in_srgb,var(--primary)_22%,var(--surface))]",
  "bg-[color-mix(in_srgb,var(--info)_13%,var(--surface))] text-info border-[color-mix(in_srgb,var(--info)_22%,var(--surface))]",
  "bg-[color-mix(in_srgb,var(--ok)_13%,var(--surface))] text-ok border-[color-mix(in_srgb,var(--ok)_22%,var(--surface))]",
  "bg-[color-mix(in_srgb,var(--warn)_15%,var(--surface))] text-warn border-[color-mix(in_srgb,var(--warn)_24%,var(--surface))]",
  "bg-n-100 text-n-700 border-n-200",
];
function tintFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
  /** A small presence dot at the corner. */
  status?: "online" | "away" | "offline";
  className?: string;
}

const STATUS = { online: "bg-ok", away: "bg-warn", offline: "bg-n-400" } as const;

/** A squircle monogram: the same soft corner as the buttons. */
export function Avatar({ name, size = "md", status, className = "" }: AvatarProps) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <span
        role="img"
        aria-label={name}
        className={`inline-flex select-none items-center justify-center rounded-[var(--r-av)] border font-display font-extrabold tracking-tight [corner-shape:squircle] ${SIZES[size]} ${tintFor(name)}`}
      >
        {initials(name)}
      </span>
      {status ? (
        <span
          aria-hidden="true"
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${STATUS[status]}`}
        />
      ) : null}
    </span>
  );
}

export function AvatarGroup({ names, max = 4, size = "md" }: { names: string[]; max?: number; size?: keyof typeof SIZES }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((name, i) => (
        <span key={name} className={`rounded-[var(--r-md)] ring-2 ring-surface ${i > 0 ? "-ml-1.5" : ""}`}>
          <Avatar name={name} size={size} />
        </span>
      ))}
      {extra > 0 ? (
        <span
          className={`-ml-1.5 inline-flex items-center justify-center rounded-[var(--r-av)] border border-n-200 bg-n-50 font-semibold text-n-600 ring-2 ring-surface [corner-shape:squircle] ${SIZES[size]}`}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
