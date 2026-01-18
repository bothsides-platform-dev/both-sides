import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createTopicSchema, getTopicsSchema } from "@/modules/topics/schema";
import { createTopic, getTopics } from "@/modules/topics/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getTopicsSchema, {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || undefined,
    });

    const result = await getTopics(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = await validateRequest(createTopicSchema, body);
    const topic = await createTopic(user.id, input);
    return Response.json({ data: topic }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
