import { NextResponse } from "next/server";
import { assertSameOrigin, createRequestContext, readJson, toErrorResponse } from "@/lib/http";
import { createProject, listProjects } from "@/lib/services";

export async function GET(req: Request) {
  try {
    const ctx = await createRequestContext(req);
    const params = new URL(req.url).searchParams;
    return NextResponse.json(
      await listProjects(ctx, { cursor: params.get("cursor") ?? undefined, limit: params.get("limit") ?? undefined }),
    );
  } catch (err) {
    return toErrorResponse(err, req);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const ctx = await createRequestContext(req);
    return NextResponse.json(await createProject(ctx, await readJson(req)), { status: 201 });
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
