import { NextRequest } from "next/server";
import { requireAuthStrict } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createTopicReport } from "@/modules/reports/service";
import { reportSchema } from "@/modules/reports/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id: topicId } = await params;
    const body = await request.json();
    const { reason } = await validateRequest(reportSchema, body);
    const report = await createTopicReport(user.id, topicId, reason);
    return Response.json({ data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
