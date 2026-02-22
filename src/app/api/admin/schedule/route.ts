import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getScheduledTopicsForMonthSchema } from "@/modules/topics/schema";
import { getScheduledTopicsForMonth } from "@/modules/topics/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getScheduledTopicsForMonthSchema, {
      year: searchParams.get("year") ?? undefined,
      month: searchParams.get("month") ?? undefined,
    });

    const topics = await getScheduledTopicsForMonth(input);
    return Response.json({ data: topics });
  } catch (error) {
    return handleApiError(error);
  }
}
