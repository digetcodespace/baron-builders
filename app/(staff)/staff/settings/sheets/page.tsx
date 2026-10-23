import { SectionOutline } from "@/components/settings/SectionOutline";

export const metadata = { title: "Sheets" };

export default function SheetsPage() {
  return (
    <SectionOutline
      title="Sheets"
      icon="clipboard"
      description="The selection sheets buyers fill out, one per house type per stage."
      will={[
        "Build a sheet from sections like Kitchen, Doors, and Paint",
        "Add choices, add-ons, quantities, and vendor items",
        "Set prices, and prices that change with another choice",
        "Show an option only when another one is picked",
        "Copy a sheet to another house type",
      ]}
    />
  );
}
