import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { toggleReaction } from "@/modules/reactions/service";
import { reactionSchema } from "@/modules/reactions/schema";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: opinionId } = await params;
    const body = await request.json();
    const { type } = await validateRequest(reactionSchema, body);

    // Reactions use visitorId+ipAddress only (no fingerprint)
    const identifier = identity.type === "user"
      ? { userId: identity.userId }
      : { visitorId: identity.visitorId, ipAddress: identity.ipAddress };

    const result = await toggleReaction(identifier, opinionId, type);

    const response = NextResponse.json({ data: result });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
