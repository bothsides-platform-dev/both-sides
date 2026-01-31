import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createFeedbackSchema } from "@/modules/feedback/schema";
import { createFeedback } from "@/modules/feedback/service";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const input = await validateRequest(createFeedbackSchema, body);

    const feedback = await createFeedback(input, session?.user?.id);

    return Response.json({ data: feedback }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
