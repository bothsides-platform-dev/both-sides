import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getVote } from "@/modules/votes/service";
import { getIpAddress } from "@/lib/visitor";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const session = await getSession();

    let vote = null;

    if (session?.user?.id) {
      // Logged-in user
      vote = await getVote({ userId: session.user.id }, topicId);
    } else {
      // Guest user - check if they have a visitor cookie
      const cookieStore = await cookies();
      const visitorId = cookieStore.get("visitor_id")?.value;
      
      if (visitorId) {
        const ipAddress = getIpAddress(request);
        vote = await getVote(
          { visitorId, ipAddress: ipAddress || undefined },
          topicId
        );
      }
    }

    return Response.json({ data: vote });
  } catch (error) {
    return handleApiError(error);
  }
}
