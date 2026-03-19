import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getPostCommentsAdminSchema } from "@/modules/post-comments/schema";
import { getPostCommentsForAdmin } from "@/modules/post-comments/service";
import type { RouteParams } from "@/types/api";

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    const input = await validateRequest(getPostCommentsAdminSchema, {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    const result = await getPostCommentsForAdmin(id, input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
