import { NextResponse } from "next/server";
import { assertSameOrigin, createPublicContext, readJson, toErrorResponse } from "@/lib/http";
import { requestSignInCode } from "@/lib/services";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ctx = await createPublicContext(req);
    return NextResponse.json(await requestSignInCode(ctx, await readJson(req)));
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
