"use client";

import type { ReactNode } from "react";
import { useSignOut } from "@/hooks/useSignOut";
import { MobileTabBar } from "./MobileTabBar";
import { Sidebar, type NavItem } from "./Sidebar";
import { TopBar, type TopBarUser } from "./TopBar";

export interface AppShellProps {
  nav: NavItem[];
  homeHref: string;
  user: TopBarUser;
  children: ReactNode;
}

/**
 * Full portal frame: sidebar on desktop, bottom tab bar on phones, a top bar
 * with the account menu (including sign out), and a soft page wash behind the content.
 */
export function AppShell({ nav, homeHref, user, children }: AppShellProps) {
  const signOut = useSignOut();
  return (
    <div className="flex min-h-dvh">
      <Sidebar items={nav} homeHref={homeHref} />
      <div className="page-wash flex min-w-0 flex-1 flex-col">
        <TopBar
          user={user}
          menu={[{ id: "sign-out", label: "Sign out", icon: "log-out", onSelect: () => void signOut() }]}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-10">{children}</main>
      </div>
      <MobileTabBar items={nav} />
    </div>
  );
}
