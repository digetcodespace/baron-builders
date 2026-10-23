import type { SectionNavGroup } from "@/components/layout";

/** Everything staff set up before a buyer sees a sheet, split by what it is for. */
export const SETTINGS_GROUPS: SectionNavGroup[] = [
  {
    label: "Setup",
    items: [
      { label: "Trades", href: "/staff/settings/trades", icon: "sliders" },
      { label: "Vendors", href: "/staff/settings/vendors", icon: "building" },
    ],
  },
  {
    label: "Team",
    items: [{ label: "People", href: "/staff/settings/people", icon: "users" }],
  },
];
