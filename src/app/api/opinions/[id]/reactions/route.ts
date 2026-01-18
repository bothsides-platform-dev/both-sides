import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { toggleReaction } from "@/modules/reactions/service";

const reactionSchema = z.object({
  type: z.enum(["LIKE", "DISLIKE"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: opinionId } = await params;
    const body = await request.json();
    const { type } = await validateRequest(reactionSchema, body);
    const result = await toggleReaction(user.id, opinionId, type);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
