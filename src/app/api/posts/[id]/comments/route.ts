import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createPostCommentSchema, getPostCommentsSchema } from "@/modules/post-comments/schema";
import { createPostComment, getPostComments } from "@/modules/post-comments/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const parentIdParam = searchParams.get("parentId");
    let parentId: string | null | undefined = undefined;
    if (parentIdParam === "null") {
      parentId = null;
    } else if (parentIdParam) {
      parentId = parentIdParam;
    }

    const input = await validateRequest(getPostCommentsSchema, {
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      parentId,
    });

    const result = await getPostComments(postId, input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: postId } = await params;
    const body = await request.json();
    const input = await validateRequest(createPostCommentSchema, body);

    const author = identity.type === "user"
      ? { type: "user" as const, userId: identity.userId }
      : { type: "guest" as const, visitorId: identity.visitorId, ipAddress: identity.ipAddress };

    const comment = await createPostComment(author, postId, input);

    const response = NextResponse.json({ data: comment }, { status: 201 });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
