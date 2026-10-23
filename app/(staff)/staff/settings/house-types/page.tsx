import { SectionOutline } from "@/components/settings/SectionOutline";

export const metadata = { title: "House types" };

export default function HouseTypesPage() {
  return (
    <SectionOutline
      title="House types"
      icon="home"
      description="The models in a project, like Corner and Middle."
      will={["Add a house type to a project", "Rename or remove one that has no houses", "See how many houses use each type"]}
    />
  );
}
