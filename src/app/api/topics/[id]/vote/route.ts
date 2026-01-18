import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { upsertVoteSchema } from "@/modules/votes/schema";
import { upsertVote } from "@/modules/votes/service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: topicId } = await params;
    const body = await request.json();
    const { side } = await validateRequest(upsertVoteSchema, body);
    const vote = await upsertVote(user.id, topicId, side);
    return Response.json({ data: vote });
  } catch (error) {
    return handleApiError(error);
  }
}
