import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getRecentOpinions } from "@/modules/opinions/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    if (type === "recent") {
      const rawLimit = parseInt(searchParams.get("limit") || "5");
      const limit = Math.max(1, Math.min(20, rawLimit));
      const opinions = await getRecentOpinions(limit);
      return Response.json({ data: { opinions } });
    }

    return Response.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
