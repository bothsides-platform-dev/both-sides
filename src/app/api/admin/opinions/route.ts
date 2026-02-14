import { NextRequest } from "next/server";
import { withAdmin } from "@/lib/api-helpers";
import { validateRequest } from "@/lib/validation";
import { getOpinionsAdminSchema } from "@/modules/opinions/schema";
import { getOpinionsForAdmin } from "@/modules/opinions/service";

export const GET = withAdmin(async (request: NextRequest) => {
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
});
