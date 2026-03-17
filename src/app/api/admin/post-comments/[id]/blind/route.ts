import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { blindPostCommentSchema } from "@/modules/post-comments/schema";
import { blindPostComment } from "@/modules/post-comments/service";
import type { RouteParams } from "@/types/api";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(blindPostCommentSchema, body);
    const comment = await blindPostComment(id, input.isBlinded);
    return Response.json({ data: comment });
  } catch (error) {
    return handleApiError(error);
  }
}
