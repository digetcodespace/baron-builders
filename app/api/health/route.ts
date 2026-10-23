import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/http";

export async function GET(req: Request) {
  try {
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err, req);
  }
}
