import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updateFeaturedSchema } from "@/modules/topics/schema";
import { updateFeatured } from "@/modules/topics/service";
import type { RouteParams } from "@/types/api";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(updateFeaturedSchema, body);
    const topic = await updateFeatured(id, input);
    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}
