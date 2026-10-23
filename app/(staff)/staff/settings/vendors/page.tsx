import { SectionOutline } from "@/components/settings/SectionOutline";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <SectionOutline
      title="Vendors"
      icon="building"
      description="The companies that do the work, and the people who sign in for them."
      will={[
        "Add a vendor company with its trade, email, and phone",
        "Add people to a company so they can sign in",
        "Assign a company to a trade in a project, or to one house type",
        "See every house where a company has an open item",
      ]}
    />
  );
}
