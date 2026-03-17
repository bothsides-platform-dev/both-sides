import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updatePostHiddenSchema } from "@/modules/posts/schema";
import { updatePostHidden } from "@/modules/posts/service";
import type { RouteParams } from "@/types/api";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(updatePostHiddenSchema, body);
    const post = await updatePostHidden(id, input.isHidden);
    return Response.json({ data: post });
  } catch (error) {
    return handleApiError(error);
  }
}
