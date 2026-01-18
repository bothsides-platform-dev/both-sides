import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createReport } from "@/modules/reports/service";

const reportSchema = z.object({
  reason: z.string().min(10, "신고 사유는 10자 이상이어야 합니다.").max(500, "신고 사유는 500자 이하여야 합니다."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: opinionId } = await params;
    const body = await request.json();
    const { reason } = await validateRequest(reportSchema, body);
    const report = await createReport(user.id, opinionId, reason);
    return Response.json({ data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
