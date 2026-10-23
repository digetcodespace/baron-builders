import { SectionOutline } from "@/components/settings/SectionOutline";

export const metadata = { title: "Trades" };

export default function TradesPage() {
  return (
    <SectionOutline
      title="Trades"
      icon="sliders"
      description="The kinds of work vendors do, like tile, kitchen, and electric."
      will={["Add and rename trades", "See which vendors cover each trade", "Choose the default vendor for a trade in each project"]}
    />
  );
}
