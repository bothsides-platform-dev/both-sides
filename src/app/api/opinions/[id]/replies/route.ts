import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createOpinionSchema } from "@/modules/opinions/schema";
import { createOpinion } from "@/modules/opinions/service";
import { resolveIdentity, applyGuestCookie } from "@/lib/visitor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await resolveIdentity(request);
    const { id: parentId } = await params;
    const body = await request.json();
    const input = await validateRequest(createOpinionSchema, {
      ...body,
      parentId,
    });

    const author = identity.type === "user"
      ? { type: "user" as const, userId: identity.userId }
      : { type: "guest" as const, visitorId: identity.visitorId, ipAddress: identity.ipAddress, fingerprint: identity.fingerprint };

    const opinion = await createOpinion(author, "", input);

    const response = NextResponse.json({ data: opinion }, { status: 201 });
    applyGuestCookie(response, identity);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
