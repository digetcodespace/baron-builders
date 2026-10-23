import Link from "next/link";
import { Icon } from "./Icon";

export interface Crumb {
  label: string;
  href?: string;
}

/** Where you are. The last crumb is the current page and is not a link. */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 t-small">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="rounded-sm transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "font-semibold text-text!" : ""}>
                  {item.label}
                </span>
              )}
              {!last ? <Icon name="chevron-right" size={14} className="text-n-400" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
