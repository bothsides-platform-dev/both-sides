import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { toggleReaction } from "@/modules/reactions/service";
import {
  getOrCreateVisitorId,
  getIpAddress,
  setVisitorIdCookie,
} from "@/lib/visitor";

const reactionSchema = z.object({
  type: z.enum(["LIKE", "DISLIKE"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: opinionId } = await params;
    const body = await request.json();
    const { type } = await validateRequest(reactionSchema, body);

    let result;
    let responseData;

    if (session?.user?.id) {
      // Logged-in user
      result = await toggleReaction(
        { userId: session.user.id },
        opinionId,
        type
      );
      responseData = Response.json({ data: result });
    } else {
      // Guest user
      const { visitorId, isNew } = await getOrCreateVisitorId();
      const ipAddress = getIpAddress(request);

      result = await toggleReaction(
        { visitorId, ipAddress: ipAddress || undefined },
        opinionId,
        type
      );

      // Create response and set cookie if new visitor
      const response = NextResponse.json({ data: result });
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
