import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getAdminStats } from "@/modules/topics/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminStats();
    return Response.json({ data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
