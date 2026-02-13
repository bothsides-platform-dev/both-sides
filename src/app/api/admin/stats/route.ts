import { withAdmin } from "@/lib/api-helpers";
import { getAdminStats } from "@/modules/topics/service";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const stats = await getAdminStats();
  return Response.json({ data: stats });
});
