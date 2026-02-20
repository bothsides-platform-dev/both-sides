import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getBattlesSchema } from "@/modules/battles/schema";
import { getBattles } from "@/modules/battles/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getBattlesSchema, {
      topicId: searchParams.get("topicId") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const result = await getBattles(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
