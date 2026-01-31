import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { markAsRead } from "@/modules/notifications/service";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    await markAsRead(id, user.id);

    return Response.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
