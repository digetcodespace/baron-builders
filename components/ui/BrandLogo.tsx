import Image from "next/image";

export interface BrandLogoProps {
  /** `full` is the horizontal lockup; `mark` is the towers only. */
  variant?: "full" | "mark";
  /** `light` for light backgrounds, `reverse` for dark ones. */
  tone?: "light" | "reverse";
  height?: number;
  className?: string;
}

const SOURCES = {
  full: { light: "/brand/baron-logo.svg", reverse: "/brand/baron-logo-reverse.svg", ratio: 140 / 48 },
  mark: { light: "/brand/baron-mark.svg", reverse: "/brand/baron-mark-reverse.svg", ratio: 1 },
} as const;

/** The logo files exactly as supplied. Never retype, stretch, or recolor them. */
export function BrandLogo({ variant = "full", tone = "light", height = 40, className }: BrandLogoProps) {
  const source = SOURCES[variant];
  return (
    <Image
      src={source[tone]}
      alt="Baron Builders"
      width={Math.round(height * source.ratio)}
      height={height}
      unoptimized
      priority
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
