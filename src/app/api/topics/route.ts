import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createTopicSchema, getTopicsSchema } from "@/modules/topics/schema";
import { createTopic, getTopics, getFeaturedTopics, getRecommendedTopics } from "@/modules/topics/service";
import { triggerTopicSummary } from "@/modules/llm/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Special endpoints for featured and recommended
    const type = searchParams.get("type");
    if (type === "featured") {
      const limit = parseInt(searchParams.get("limit") || "2");
      const topics = await getFeaturedTopics(limit);
      return Response.json({ data: { topics } });
    }
    if (type === "recommended") {
      const limit = parseInt(searchParams.get("limit") || "6");
      const topics = await getRecommendedTopics(limit);
      return Response.json({ data: { topics } });
    }

    const input = await validateRequest(getTopicsSchema, {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || undefined,
      featured: searchParams.get("featured") || undefined,
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
    triggerTopicSummary(topic.id).catch(err => console.error("[LLM] Topic summary failed:", err));
    return Response.json({ data: topic }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
