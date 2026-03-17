import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { deletePostComment } from "@/modules/post-comments/service";
import type { RouteParams } from "@/types/api";

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deletePostComment(id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
