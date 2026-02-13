import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { upsertVoteSchema } from "@/modules/votes/schema";
import { upsertVote } from "@/modules/votes/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: topicId } = await params;
    const body = await request.json();
    const { side } = await validateRequest(upsertVoteSchema, body);

    const vote = identity.type === "user"
      ? await upsertVote({ userId: identity.userId }, topicId, side)
      : await upsertVote(
          { visitorId: identity.visitorId, ipAddress: identity.ipAddress, fingerprint: identity.fingerprint },
          topicId,
          side
        );

    const response = NextResponse.json({ data: vote });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
