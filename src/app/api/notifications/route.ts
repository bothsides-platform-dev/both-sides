import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { getNotificationsSchema } from "@/modules/notifications/schema";
import { getNotifications } from "@/modules/notifications/service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const input = await validateRequest(getNotificationsSchema, {
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const result = await getNotifications(user.id, input);

    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
