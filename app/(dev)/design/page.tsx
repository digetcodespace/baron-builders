import { ComponentGallery } from "@/components/dev/ComponentGallery";

export const metadata = { title: "Components" };

/** The live component reference. Visible during build-out; restrict or remove before launch. */
export default function DesignPage() {
  return <ComponentGallery />;
}
