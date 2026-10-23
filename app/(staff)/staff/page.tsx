import { HouseList } from "@/components/houses/HouseList";
import { PageHeader } from "@/components/ui";
import { createRequestContext } from "@/lib/http";
import { listHouses } from "@/lib/services";

export const metadata = { title: "Dashboard" };

export default async function StaffDashboardPage() {
  const ctx = await createRequestContext();
  const firstPage = await listHouses(ctx, {});
  return (
    <>
      <PageHeader title="Dashboard" description="Every house and where it stands." />
      <HouseList initialPage={firstPage} />
    </>
  );
}
