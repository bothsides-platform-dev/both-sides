import { withAdmin } from "@/lib/api-helpers";
import { getFeedbackStats } from "@/modules/feedback/service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const stats = await getFeedbackStats();
  return Response.json({ data: stats });
});
