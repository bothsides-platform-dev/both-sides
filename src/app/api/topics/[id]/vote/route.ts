import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { upsertVoteSchema } from "@/modules/votes/schema";
import { upsertVote } from "@/modules/votes/service";
import {
  getOrCreateVisitorId,
  getIpAddress,
  setVisitorIdCookie,
} from "@/lib/visitor";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: topicId } = await params;
    const body = await request.json();
    const { side } = await validateRequest(upsertVoteSchema, body);

    let vote;
    let responseData;

    if (session?.user?.id) {
      // Logged-in user
      vote = await upsertVote({ userId: session.user.id }, topicId, side);
      responseData = Response.json({ data: vote });
    } else {
      // Guest user
      const { visitorId, isNew } = await getOrCreateVisitorId();
      const ipAddress = getIpAddress(request);

      vote = await upsertVote(
        { visitorId, ipAddress: ipAddress || undefined },
        topicId,
        side
      );

      // Create response and set cookie if new visitor
      const response = NextResponse.json({ data: vote });
      if (isNew) {
        setVisitorIdCookie(response, visitorId);
      }
      responseData = response;
    }

    return responseData;
  } catch (error) {
    return handleApiError(error);
  }
}
