import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getUserVote } from "@/modules/votes/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return Response.json({ data: null });
    }

    const { id: topicId } = await params;
    const vote = await getUserVote(session.user.id, topicId);
    return Response.json({ data: vote });
  } catch (error) {
    return handleApiError(error);
  }
}
