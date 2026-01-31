import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getUsersAdminSchema } from "@/modules/users/schema";
import { getUsersForAdmin } from "@/modules/users/service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const input = await validateRequest(getUsersAdminSchema, {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
    });

    const result = await getUsersForAdmin(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
