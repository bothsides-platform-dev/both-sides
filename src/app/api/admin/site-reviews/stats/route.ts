import { withAdmin } from "@/lib/api-helpers";
import { getSiteReviewStats } from "@/modules/site-reviews/service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const stats = await getSiteReviewStats();
  return Response.json({ data: stats });
});
