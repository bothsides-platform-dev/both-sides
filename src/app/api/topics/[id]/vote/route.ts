import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { upsertVoteBinarySchema, upsertVoteMultipleSchema, upsertVoteNumericSchema } from "@/modules/votes/schema";
import { upsertVote } from "@/modules/votes/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: topicId } = await params;
    const body = await request.json();

    // Get topic type to determine which schema to use
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { topicType: true },
    });

    if (!topic) {
      return NextResponse.json({ error: "토론을 찾을 수 없습니다." }, { status: 404 });
    }

    let voteData: { side?: "A" | "B"; optionId?: string; numericValue?: number };

    if (topic.topicType === "MULTIPLE") {
      const { optionId } = await validateRequest(upsertVoteMultipleSchema, body);
      voteData = { optionId };
    } else if (topic.topicType === "NUMERIC") {
      const { numericValue } = await validateRequest(upsertVoteNumericSchema, body);
      voteData = { numericValue };
    } else {
      const { side } = await validateRequest(upsertVoteBinarySchema, body);
      voteData = { side };
    }

    const vote = identity.type === "user"
      ? await upsertVote({ userId: identity.userId }, topicId, voteData)
      : await upsertVote(
          { visitorId: identity.visitorId, ipAddress: identity.ipAddress, fingerprint: identity.fingerprint },
          topicId,
          voteData
        );

    const response = NextResponse.json({ data: vote });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
