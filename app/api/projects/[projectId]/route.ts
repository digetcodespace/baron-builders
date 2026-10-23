import { NextResponse } from "next/server";
import { assertSameOrigin, createRequestContext, readJson, toErrorResponse } from "@/lib/http";
import { getProject, saveProjectWithStages } from "@/lib/services";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const ctx = await createRequestContext(req);
    return NextResponse.json(await getProject(ctx, await params));
  } catch (err) {
    return toErrorResponse(err, req);
  }
}

/** Save the project's name and stages (in order). */
export async function PUT(req: Request, { params }: Params) {
  try {
    assertSameOrigin(req);
    const ctx = await createRequestContext(req);
    const { projectId } = await params;
    const body = (await readJson(req)) as Record<string, unknown>;
    return NextResponse.json(await saveProjectWithStages(ctx, { ...body, projectId }));
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
