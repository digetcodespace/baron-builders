import { NextResponse } from "next/server";
import { createRequestContext, toErrorResponse } from "@/lib/http";
import { listVendors } from "@/lib/services";

export async function GET(req: Request) {
  try {
    const ctx = await createRequestContext(req);
    const params = new URL(req.url).searchParams;
    return NextResponse.json(
      await listVendors(ctx, { cursor: params.get("cursor") ?? undefined, limit: params.get("limit") ?? undefined }),
    );
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
