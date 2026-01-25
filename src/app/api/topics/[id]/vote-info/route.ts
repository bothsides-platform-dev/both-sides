import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getVoteStats, getVote } from "@/modules/votes/service";
import { getIpAddress } from "@/lib/visitor";
import { cookies } from "next/headers";
import type { Vote } from "@prisma/client";

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

    let myVotePromise: Promise<Vote | null> = Promise.resolve(null);

    if (includeMyVote) {
      if (userId) {
        // Logged-in user
        myVotePromise = getVote({ userId }, topicId);
      } else {
        // Guest user - check if they have a visitor cookie
        const cookieStore = await cookies();
        const visitorId = cookieStore.get("visitor_id")?.value;
        
        if (visitorId) {
          const ipAddress = getIpAddress(request);
          myVotePromise = getVote(
            { visitorId, ipAddress: ipAddress || undefined },
            topicId
          );
        }
      }
    }

    const [stats, myVote] = await Promise.all([
      getVoteStats(topicId),
      myVotePromise,
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
