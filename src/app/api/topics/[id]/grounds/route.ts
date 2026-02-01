import { handleApiError } from "@/lib/errors";
import { getGroundsSummary } from "@/modules/llm/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const grounds = await getGroundsSummary(topicId);
    return Response.json({ data: grounds });
  } catch (error) {
    return handleApiError(error);
  }
}
