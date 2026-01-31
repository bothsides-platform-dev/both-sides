import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getUnreadCount } from "@/modules/notifications/service";

export async function GET() {
  try {
    const user = await requireAuth();
    const unreadCount = await getUnreadCount(user.id);

    return Response.json({ data: { unreadCount } });
  } catch (error) {
    return handleApiError(error);
  }
}
