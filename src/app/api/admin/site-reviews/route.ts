import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/api-helpers";
import { validateRequest } from "@/lib/validation";
import { getSiteReviewsSchema } from "@/modules/site-reviews/schema";
import { getSiteReviews } from "@/modules/site-reviews/service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const input = await validateRequest(getSiteReviewsSchema, {
    scoreGroup: searchParams.get("scoreGroup") || undefined,
    page: searchParams.get("page") || 1,
    limit: searchParams.get("limit") || 20,
  });

  const result = await getSiteReviews(input);
  return Response.json({ data: result });
});
