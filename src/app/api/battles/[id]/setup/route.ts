import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { validateRequest } from "@/lib/validation";
import { setupBattleSchema } from "@/modules/battles/schema";
import { setupBattle } from "@/modules/battles/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(setupBattleSchema, body);

    const battle = await setupBattle(id, user.id, input.durationSeconds);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
