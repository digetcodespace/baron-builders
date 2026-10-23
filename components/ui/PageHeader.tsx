import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { InfoHint } from "./InfoHint";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Longer explanation, tucked behind a small "i" beside the title instead of printed under it. */
  info?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
  className?: string;
}

/** The one title surface per page. Never a hand-rolled `<h1>` cluster. */
export function PageHeader({ title, description, info, back, actions, className = "" }: PageHeaderProps) {
  return (
    <header className={`mb-6 ${className}`}>
      {back ? (
        <Link
          href={back.href}
          className="group/back mb-3 inline-flex items-center gap-1 t-small transition-colors hover:text-primary"
        >
          <Icon name="arrow-left" size={14} className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] group-hover/back:-translate-x-0.5" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="t-h2">{title}</h1>
            {info ? <InfoHint label={`About ${title}`}>{info}</InfoHint> : null}
          </div>
          {description ? <p className="mt-1.5 max-w-prose t-small">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
