import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getVoteStats, getUserVote } from "@/modules/votes/service";

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

    const session = await getSession();
    const userId = session?.user?.id;

    const [stats, myVote] = await Promise.all([
      getVoteStats(topicId),
      includeMyVote && userId ? getUserVote(userId, topicId) : Promise.resolve(null),
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
