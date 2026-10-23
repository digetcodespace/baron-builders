import type { SectionNavGroup } from "@/components/layout";

/** Everything staff set up before a buyer sees a sheet, split by what it is for. */
export const SETTINGS_GROUPS: SectionNavGroup[] = [
  {
    label: "Projects",
    items: [
      { label: "Projects and stages", href: "/staff/settings/projects", icon: "layers" },
      { label: "House types", href: "/staff/settings/house-types", icon: "home" },
    ],
  },
  {
    label: "Selections",
    items: [
      { label: "Sheets", href: "/staff/settings/sheets", icon: "clipboard" },
      { label: "Trades", href: "/staff/settings/trades", icon: "sliders" },
    ],
  },
  {
    label: "Companies",
    items: [{ label: "Vendors", href: "/staff/settings/vendors", icon: "building" }],
  },
  {
    label: "Team",
    items: [{ label: "People", href: "/staff/settings/people", icon: "users" }],
  },
];
