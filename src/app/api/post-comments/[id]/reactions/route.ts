import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { togglePostCommentReaction } from "@/modules/post-comment-reactions/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: postCommentId } = await params;
    const { type } = await request.json();

    const identifier = identity.type === "user"
      ? { userId: identity.userId }
      : { visitorId: identity.visitorId, ipAddress: identity.ipAddress };

    const result = await togglePostCommentReaction(identifier, postCommentId, type);

    const response = NextResponse.json({ data: result });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
