"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui";
import { isActivePath } from "./Sidebar";

export interface SectionNavItem {
  label: string;
  href: string;
  icon: IconName;
}

export interface SectionNavGroup {
  /** Small caps heading above the group. */
  label: string;
  items: SectionNavItem[];
}

/**
 * Second-level navigation for an area with many sections (Settings). A grouped list beside the
 * page on wide screens; one scrolling row of tabs on a phone, so every section stays one tap away.
 */
export function SectionNav({ groups, label }: { groups: SectionNavGroup[]; label: string }) {
  const pathname = usePathname();
  const all = groups.flatMap((g) => g.items);
  const active = all.filter((i) => isActivePath(pathname, i.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={label} className="min-w-0">
      {/* Phone: one row */}
      <ul className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 pb-2 md:hidden">
        {all.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.href === active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-[var(--r-md)] px-3 py-2 t-small transition-colors duration-[var(--dur-base)] ${item.href === active ? "bg-primary-soft font-semibold text-text" : "hover:bg-ink-soft"}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Wide: grouped list */}
      <div className="hidden space-y-6 md:block">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 t-label text-n-600">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const on = item.href === active;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={on ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-[var(--r-md)] px-3 py-2 t-small transition-colors duration-[var(--dur-base)] ease-[var(--ease-smooth)] ${on ? "bg-primary-soft font-semibold text-text" : "text-n-600 hover:bg-ink-soft hover:text-text"}`}
                    >
                      <Icon name={item.icon} size={16} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
