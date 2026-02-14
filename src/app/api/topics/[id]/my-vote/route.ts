import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { resolveCurrentUserVote } from "@/lib/visitor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const vote = await resolveCurrentUserVote(request, topicId);
    return Response.json({ data: vote });
  } catch (error) {
    return handleApiError(error);
  }
}
