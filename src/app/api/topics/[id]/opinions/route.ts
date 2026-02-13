import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createOpinionSchema, getOpinionsSchema } from "@/modules/opinions/schema";
import { createOpinion, getOpinions } from "@/modules/opinions/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Handle parentId parameter - can be "null" string or actual ID
    const parentIdParam = searchParams.get("parentId");
    let parentId: string | null | undefined = undefined;
    if (parentIdParam === "null") {
      parentId = null;
    } else if (parentIdParam) {
      parentId = parentIdParam;
    }

    const input = await validateRequest(getOpinionsSchema, {
      side: searchParams.get("side") || undefined,
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      parentId,
    });

    const result = await getOpinions(topicId, input);
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
    const { id: topicId } = await params;
    const body = await request.json();
    const input = await validateRequest(createOpinionSchema, body);

    const author = identity.type === "user"
      ? { type: "user" as const, userId: identity.userId }
      : { type: "guest" as const, visitorId: identity.visitorId, ipAddress: identity.ipAddress, fingerprint: identity.fingerprint };

    const opinion = await createOpinion(author, topicId, input);

    const response = NextResponse.json({ data: opinion }, { status: 201 });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
