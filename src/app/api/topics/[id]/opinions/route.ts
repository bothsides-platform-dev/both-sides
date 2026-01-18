import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createOpinionSchema, getOpinionsSchema } from "@/modules/opinions/schema";
import { createOpinion, getOpinions } from "@/modules/opinions/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getOpinionsSchema, {
      side: searchParams.get("side") || undefined,
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
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
    const user = await requireAuth();
    const { id: topicId } = await params;
    const body = await request.json();
    const input = await validateRequest(createOpinionSchema, body);
    const opinion = await createOpinion(user.id, topicId, input);
    return Response.json({ data: opinion }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
