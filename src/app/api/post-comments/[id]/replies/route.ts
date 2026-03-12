import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createPostCommentSchema } from "@/modules/post-comments/schema";
import { createPostComment } from "@/modules/post-comments/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: parentId } = await params;

    // Get parent comment to find postId
    const parentComment = await prisma.postComment.findUnique({
      where: { id: parentId },
      select: { postId: true },
    });

    if (!parentComment) {
      throw new NotFoundError("댓글을 찾을 수 없습니다.");
    }

    const body = await request.json();
    const input = await validateRequest(createPostCommentSchema, {
      ...body,
      parentId,
    });

    const author = identity.type === "user"
      ? { type: "user" as const, userId: identity.userId }
      : { type: "guest" as const, visitorId: identity.visitorId, ipAddress: identity.ipAddress };

    const comment = await createPostComment(author, parentComment.postId, input);

    const response = NextResponse.json({ data: comment }, { status: 201 });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
