import { NextResponse } from "next/server";
import { createRequestContext, toErrorResponse } from "@/lib/http";
import { listHouses } from "@/lib/services";

export async function GET(req: Request) {
  try {
    const ctx = await createRequestContext(req);
    const params = new URL(req.url).searchParams;
    const page = await listHouses(ctx, {
      cursor: params.get("cursor") ?? undefined,
      limit: params.get("limit") ?? undefined,
      projectId: params.get("projectId") ?? undefined,
    });
    return NextResponse.json(page);
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
