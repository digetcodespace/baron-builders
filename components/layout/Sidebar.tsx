"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { BrandLogo, Icon, IconButton, type IconName } from "@/components/ui";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  badge?: string | number;
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

/** Staff navigation rail. Collapses to icons; a red marker slides to the current page. */
export function Sidebar({ items, homeHref }: { items: NavItem[]; homeHref: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const refs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(null);
  const activeHref = items.find((i) => isActivePath(pathname, i.href))?.href;

  useLayoutEffect(() => {
    const el = activeHref ? refs.current[activeHref] : null;
    const frame = requestAnimationFrame(() => setMarker(el ? { top: el.offsetTop, height: el.offsetHeight } : null));
    return () => cancelAnimationFrame(frame);
  }, [activeHref, collapsed, items]);

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-out)] md:flex ${collapsed ? "w-[4.5rem]" : "w-64"}`}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href={homeHref} aria-label="Baron Builders home" className="overflow-hidden">
          <BrandLogo variant={collapsed ? "mark" : "full"} height={collapsed ? 34 : 38} />
        </Link>
      </div>
      <nav aria-label="Main" className="relative flex-1 space-y-1 p-3">
        {marker ? (
          <span
            aria-hidden="true"
            className="absolute left-0 w-1 rounded-r-full bg-primary transition-[top,height] duration-[var(--dur-slow)] ease-[var(--ease-spring)]"
            style={{ top: marker.top, height: marker.height }}
          />
        ) : null}
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              ref={(el) => {
                refs.current[item.href] = el;
              }}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={`group/nav relative flex h-11 items-center gap-3 rounded-md px-3 t-ui transition-colors duration-[var(--dur-fast)] ${active ? "bg-primary-soft font-semibold text-primary-hover" : "text-n-700 hover:bg-ink-soft"}`}
            >
              <Icon name={item.icon} size={20} className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] group-hover/nav:scale-110" />
              <span className={`flex-1 truncate transition-opacity duration-[var(--dur-base)] ${collapsed ? "pointer-events-none w-0 opacity-0" : "opacity-100"}`}>
                {item.label}
              </span>
              {item.badge !== undefined && !collapsed ? (
                <span className="rounded-full bg-primary px-2 py-px t-label text-on-primary">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <IconButton
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          icon={collapsed ? "chevron-right" : "chevron-left"}
          onClick={() => setCollapsed((v) => !v)}
        />
      </div>
    </aside>
  );
}
