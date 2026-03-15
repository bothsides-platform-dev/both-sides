import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { validateRequest } from "@/lib/validation";
import { createPostChallengeSchema } from "@/modules/battles/schema";
import { createPostChallenge } from "@/modules/battles/service";

export async function POST(request: Request) {
  try {
    const user = await requireAuthStrict();
    const body = await request.json();
    const input = await validateRequest(createPostChallengeSchema, body);

    const battle = await createPostChallenge(user.id, input);
    return Response.json({ data: battle }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
