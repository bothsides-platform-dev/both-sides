import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updateHiddenSchema } from "@/modules/topics/schema";
import { updateHidden } from "@/modules/topics/service";
import type { RouteParams } from "@/types/api";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(updateHiddenSchema, body);
    const topic = await updateHidden(id, input);
    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}
