import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getPost } from "@/modules/posts/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await getPost(id);
    return Response.json({ data: post });
  } catch (error) {
    return handleApiError(error);
  }
}
