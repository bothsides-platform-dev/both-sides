import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { triggerGroundsSummary } from "@/modules/llm/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: topicId } = await params;
    await triggerGroundsSummary(topicId);
    return Response.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
