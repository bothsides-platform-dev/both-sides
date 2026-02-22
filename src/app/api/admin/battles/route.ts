import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getBattlesAdminSchema } from "@/modules/battles/schema";
import { getBattlesForAdmin, getAdminBattleStats } from "@/modules/battles/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;

    // Return stats if requested
    if (searchParams.get("stats") === "true") {
      const stats = await getAdminBattleStats();
      return Response.json({ data: stats });
    }

    const input = await validateRequest(getBattlesAdminSchema, {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await getBattlesForAdmin(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
