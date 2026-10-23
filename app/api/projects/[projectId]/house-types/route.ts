import { NextResponse } from "next/server";
import { assertSameOrigin, createRequestContext, readJson, toErrorResponse } from "@/lib/http";
import { createHouseType, listHouseTypes } from "@/lib/services";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await createRequestContext(req);
    const { projectId } = await params;
    const query = new URL(req.url).searchParams;
    return NextResponse.json(await listHouseTypes(ctx, { projectId, cursor: query.get("cursor") ?? undefined, limit: query.get("limit") ?? undefined }));
  } catch (err) {
    return toErrorResponse(err, req);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const ctx = await createRequestContext(req);
    const { projectId } = await params;
    const body = (await readJson(req)) as Record<string, unknown>;
    return NextResponse.json(await createHouseType(ctx, { ...body, projectId }), { status: 201 });
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
