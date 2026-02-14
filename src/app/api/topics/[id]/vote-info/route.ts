import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getVoteStats } from "@/modules/votes/service";
import { resolveCurrentUserVote } from "@/lib/visitor";

/**
 * Combined endpoint for vote stats and user's vote
 * Reduces 2 sequential requests to 1 with Promise.all
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const includeMyVote = request.nextUrl.searchParams.get("includeMyVote") === "true";

    const [stats, myVote] = await Promise.all([
      getVoteStats(topicId),
      includeMyVote ? resolveCurrentUserVote(request, topicId) : null,
    ]);

    return Response.json({
      data: {
        stats,
        myVote: myVote?.side ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
