import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { validateRequest } from "@/lib/validation";
import { createChallengeSchema } from "@/modules/battles/schema";
import { createChallenge } from "@/modules/battles/service";

export async function POST(request: Request) {
  try {
    const user = await requireAuthStrict();
    const body = await request.json();
    const input = await validateRequest(createChallengeSchema, body);

    const battle = await createChallenge(user.id, input);
    return Response.json({ data: battle }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
