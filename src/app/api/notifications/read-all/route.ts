import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { markAllAsRead } from "@/modules/notifications/service";

export async function PATCH() {
  try {
    const user = await requireAuth();
    await markAllAsRead(user.id);

    return Response.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
