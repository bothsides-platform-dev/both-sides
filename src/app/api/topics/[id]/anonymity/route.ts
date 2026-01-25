import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updateTopicAnonymitySchema } from "@/modules/topics/schema";
import { updateTopicAnonymity } from "@/modules/topics/service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(updateTopicAnonymitySchema, body);
    const topic = await updateTopicAnonymity(id, user.id, input);
    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}
