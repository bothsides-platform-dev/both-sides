import { handleApiError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { getUserActiveBattle, runLazyCleanup } from "@/modules/battles/service";

export async function GET() {
  try {
    runLazyCleanup();
    const user = await requireAuth();
    const battle = await getUserActiveBattle(user.id);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
