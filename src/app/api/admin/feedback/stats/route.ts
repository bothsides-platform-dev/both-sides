import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getFeedbackStats } from "@/modules/feedback/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const stats = await getFeedbackStats();
    return Response.json({ data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
