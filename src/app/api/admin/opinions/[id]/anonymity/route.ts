import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { updateOpinionAnonymityByAdmin } from "@/modules/opinions/service";
import type { RouteParams } from "@/types/api";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { isAnonymous } = body;

    if (typeof isAnonymous !== "boolean") {
      return Response.json(
        { error: "isAnonymous must be a boolean" },
        { status: 400 }
      );
    }

    const opinion = await updateOpinionAnonymityByAdmin(id, isAnonymous);
    return Response.json({ data: opinion });
  } catch (error) {
    return handleApiError(error);
  }
}
