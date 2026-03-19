import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getPost, deletePost } from "@/modules/posts/service";
import type { RouteParams } from "@/types/api";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const post = await getPost(id);
    return Response.json({ data: post });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deletePost(id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
