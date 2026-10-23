import { NextResponse } from "next/server";
import { assertSameOrigin, createRequestContext, readJson, toErrorResponse } from "@/lib/http";
import { deleteHouseType, renameHouseType } from "@/lib/services";

type Params = { params: Promise<{ houseTypeId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const ctx = await createRequestContext(req);
    const { houseTypeId } = await params;
    const body = (await readJson(req)) as Record<string, unknown>;
    return NextResponse.json(await renameHouseType(ctx, { ...body, houseTypeId }));
  } catch (err) {
    return toErrorResponse(err, req);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const ctx = await createRequestContext(req);
    await deleteHouseType(ctx, await params);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
