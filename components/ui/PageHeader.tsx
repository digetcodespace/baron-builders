import Link from "next/link";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  className?: string;
}

/** The one title surface per page. Never a hand-rolled `<h1>` cluster. */
export function PageHeader({ title, description, back, actions, className = "" }: PageHeaderProps) {
  return (
    <header className={`mb-6 ${className}`}>
      {back ? (
        <Link href={back.href} className="mb-2 inline-block t-small hover:underline">
          ← {back.label}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="t-h2">{title}</h1>
          {description ? <p className="mt-1 t-small">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
