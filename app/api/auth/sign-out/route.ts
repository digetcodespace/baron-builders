import { NextResponse } from "next/server";
import { assertSameOrigin, createPublicContext, toErrorResponse } from "@/lib/http";
import { signOut } from "@/lib/services";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await signOut(await createPublicContext(req));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
