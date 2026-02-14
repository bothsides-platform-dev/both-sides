import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/api-helpers";
import { validateRequest } from "@/lib/validation";
import { getFeedbacksSchema, updateFeedbackSchema } from "@/modules/feedback/schema";
import { getFeedbacks, updateFeedback } from "@/modules/feedback/service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const input = await validateRequest(getFeedbacksSchema, {
    status: searchParams.get("status") || undefined,
    category: searchParams.get("category") || undefined,
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 20,
  });

  const result = await getFeedbacks(input);
  return Response.json({ data: result });
});

export const PUT = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  const input = await validateRequest(updateFeedbackSchema, body);
  const feedback = await updateFeedback(input);

  return Response.json({ data: feedback });
});
