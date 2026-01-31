import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getFeedbacksSchema, updateFeedbackSchema } from "@/modules/feedback/schema";
import { getFeedbacks, updateFeedback } from "@/modules/feedback/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getFeedbacksSchema, {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    const result = await getFeedbacks(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const input = await validateRequest(updateFeedbackSchema, body);
    const feedback = await updateFeedback(input);

    return Response.json({ data: feedback });
  } catch (error) {
    return handleApiError(error);
  }
}
