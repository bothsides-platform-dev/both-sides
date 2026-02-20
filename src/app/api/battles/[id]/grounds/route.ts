import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { validateRequest } from "@/lib/validation";
import { submitGroundSchema } from "@/modules/battles/schema";
import { submitGround } from "@/modules/battles/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(submitGroundSchema, body);

    const battle = await submitGround(id, user.id, input.content);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
