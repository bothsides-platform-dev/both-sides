import { NextRequest } from "next/server";
import { requireAuthStrict } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { createPostCommentReport } from "@/modules/reports/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id: postCommentId } = await params;
    const { reason } = await request.json();
    const report = await createPostCommentReport(user.id, postCommentId, reason);
    return Response.json({ data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
