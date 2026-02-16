import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrCreateVisitorId } from "@/lib/visitor";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createSiteReviewSchema } from "@/modules/site-reviews/schema";
import { createSiteReview } from "@/modules/site-reviews/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const input = await validateRequest(createSiteReviewSchema, body);

    let visitorId: string | undefined;
    if (!session?.user?.id) {
      const visitor = await getOrCreateVisitorId();
      visitorId = visitor.visitorId;
    }

    const review = await createSiteReview(input, session?.user?.id, visitorId);

    return Response.json({ data: review }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
