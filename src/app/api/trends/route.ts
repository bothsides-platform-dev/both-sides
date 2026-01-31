import { handleApiError } from "@/lib/errors";
import { getTrendingSearches } from "@/modules/trends/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getTrendingSearches();
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
