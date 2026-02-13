import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createReport } from "@/modules/reports/service";
import { reportSchema } from "@/modules/reports/schema";

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
