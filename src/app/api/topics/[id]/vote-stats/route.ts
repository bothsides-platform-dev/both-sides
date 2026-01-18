import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getVoteStats } from "@/modules/votes/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const stats = await getVoteStats(topicId);
    return Response.json({ data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
