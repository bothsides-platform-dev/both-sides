import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { incrementPostViewCount } from "@/modules/posts/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await incrementPostViewCount(id);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
