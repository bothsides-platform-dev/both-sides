import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getTopicsAdminSchema } from "@/modules/topics/schema";
import { getTopicsForAdmin } from "@/modules/topics/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getTopicsAdminSchema, {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await getTopicsForAdmin(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
