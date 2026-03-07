import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { validateRequest } from "@/lib/validation";
import { respondChallengeSchema } from "@/modules/battles/schema";
import { respondToChallenge } from "@/modules/battles/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(respondChallengeSchema, body);

    const battle = await respondToChallenge(id, user.id, input.action, input.counterDuration);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
