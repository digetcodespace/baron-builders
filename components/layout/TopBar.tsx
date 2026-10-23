"use client";

import { Avatar, BrandLogo, Menu, type MenuItem } from "@/components/ui";

export interface TopBarUser {
  name: string;
  email: string;
  roleLabel: string;
}

/** Header strip: logo on phones, the person's menu, and room for page-level controls. */
export function TopBar({ user, menu }: { user: TopBarUser; menu: MenuItem[] }) {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-glass px-4 backdrop-blur-md md:px-6">
      <div className="md:hidden">
        <BrandLogo variant="full" height={26} />
      </div>
      <div className="hidden md:block" />
      <Menu
        label="Account"
        items={menu}
        trigger={(props) => (
          <button
            {...props}
            type="button"
            className="group/user flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2.5 transition-colors duration-[var(--dur-fast)] hover:bg-ink-soft"
          >
            <Avatar name={user.name} size="sm" />
            <span className="hidden text-left md:block">
              <span className="block t-small font-semibold leading-tight text-text">{user.name}</span>
              <span className="block text-[length:var(--fs-label)] !tracking-normal normal-case text-muted">{user.roleLabel}</span>
            </span>
          </button>
        )}
      />
    </header>
  );
}
