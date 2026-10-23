"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { isActivePath, type NavItem } from "./Sidebar";

/** Bottom navigation for phones (buyers and vendors use the portal on their phones). */
export function MobileTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-border bg-glass pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group/tab relative flex flex-col items-center gap-0.5 py-2.5 transition-colors"
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-[var(--dur-base)] ease-[var(--ease-spring)] ${active ? "bg-primary-soft text-primary" : "text-n-500 group-active/tab:scale-90"}`}
                >
                  <Icon name={item.icon} size={22} />
                </span>
                <span className={`t-label !tracking-normal normal-case ${active ? "text-primary" : "text-n-500"}`}>{item.label}</span>
                {item.badge !== undefined ? (
                  <span className="absolute right-[calc(50%-1.9rem)] top-1.5 rounded-full bg-primary px-1.5 py-px t-label text-on-primary">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
