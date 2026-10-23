import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lifts and outlines on hover; use for clickable cards. */
  interactive?: boolean;
  /** `flat` drops the shadow for cards nested inside other surfaces. */
  flat?: boolean;
  padded?: boolean;
}

/** The standard surface. Pair with CardHeader / CardFooter for structure. */
export function Card({ interactive = false, flat = false, padded = true, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface transition-[box-shadow,transform,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] ${flat ? "" : "shadow-low"} ${interactive ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary-line hover:shadow-high active:translate-y-0" : ""} ${padded ? "p-5" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="t-h4">{title}</h3>
        {description ? <p className="mt-0.5 t-small">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="-mx-5 -mb-5 mt-5 flex justify-end gap-2 rounded-b-lg border-t border-border bg-n-50 px-5 py-3">{children}</div>;
}
