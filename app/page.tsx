import { redirectToPortal } from "@/lib/http";

export default async function Home() {
  return redirectToPortal();
}

/** Role-gated per request; never prerender. */
export const dynamic = "force-dynamic";
