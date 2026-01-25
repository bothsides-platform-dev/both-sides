import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getOpinionsAdminSchema } from "@/modules/opinions/schema";
import { getOpinionsForAdmin } from "@/modules/opinions/service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getOpinionsAdminSchema, {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      topicId: searchParams.get("topicId") || undefined,
      isBlinded: searchParams.get("isBlinded") || undefined,
    });

    const result = await getOpinionsForAdmin(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
