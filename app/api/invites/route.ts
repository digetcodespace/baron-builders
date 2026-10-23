import { NextResponse } from "next/server";
import { assertSameOrigin, createRequestContext, readJson, toErrorResponse } from "@/lib/http";
import { inviteUser } from "@/lib/services";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ctx = await createRequestContext(req);
    return NextResponse.json(await inviteUser(ctx, await readJson(req)), { status: 201 });
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
