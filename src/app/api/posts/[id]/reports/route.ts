import { NextRequest } from "next/server";
import { requireAuthStrict } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { createPostReport } from "@/modules/reports/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id: postId } = await params;
    const { reason } = await request.json();
    const report = await createPostReport(user.id, postId, reason);
    return Response.json({ data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
