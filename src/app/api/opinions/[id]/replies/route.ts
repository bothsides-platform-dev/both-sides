import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createOpinionSchema } from "@/modules/opinions/schema";
import { createOpinion } from "@/modules/opinions/service";
import { getOrCreateVisitorId, getIpAddress, setVisitorIdCookie } from "@/lib/visitor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: parentId } = await params;
    const body = await request.json();
    const input = await validateRequest(createOpinionSchema, {
      ...body,
      parentId,
    });

    if (session?.user?.id) {
      // Logged-in user
      const opinion = await createOpinion(
        { type: "user", userId: session.user.id },
        "",
        input
      );
      return Response.json({ data: opinion }, { status: 201 });
    } else {
      // Guest user
      const { visitorId, isNew } = await getOrCreateVisitorId();
      const ipAddress = getIpAddress(request);
      const opinion = await createOpinion(
        { type: "guest", visitorId, ipAddress: ipAddress || undefined },
        "",
        input
      );

      const response = NextResponse.json({ data: opinion }, { status: 201 });
      if (isNew) {
        setVisitorIdCookie(response, visitorId);
      }
      return response;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
