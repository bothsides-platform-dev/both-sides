import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/errors";
import { getTopic } from "@/modules/topics/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const topic = await getTopic(id);
    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}
