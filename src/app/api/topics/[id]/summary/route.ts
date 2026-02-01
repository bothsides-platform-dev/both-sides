import { handleApiError } from "@/lib/errors";
import { getTopicSummary } from "@/modules/llm/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const summary = await getTopicSummary(topicId);
    return Response.json({ data: summary });
  } catch (error) {
    return handleApiError(error);
  }
}
