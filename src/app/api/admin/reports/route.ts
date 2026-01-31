import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getReports, updateReportStatus, type ReportType } from "@/modules/reports/service";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as "PENDING" | "REVIEWED" | "DISMISSED" | null;
    const type = searchParams.get("type") as ReportType | null;

    const reports = await getReports(status ?? undefined, type ?? undefined);
    return Response.json({ data: reports });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateReportSchema = z.object({
  id: z.string(),
  status: z.enum(["REVIEWED", "DISMISSED"]),
});

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { id, status } = await validateRequest(updateReportSchema, body);
    const report = await updateReportStatus(id, status);

    return Response.json({ data: report });
  } catch (error) {
    return handleApiError(error);
  }
}
