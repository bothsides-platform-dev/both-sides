import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getPostsAdminSchema } from "@/modules/posts/schema";
import { getPostsForAdmin, getPostAdminStats } from "@/modules/posts/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;

    if (searchParams.get("stats") === "true") {
      const stats = await getPostAdminStats();
      return Response.json({ data: stats });
    }

    const input = await validateRequest(getPostsAdminSchema, {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await getPostsForAdmin(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
