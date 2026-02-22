import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { hideBattleSchema } from "@/modules/battles/schema";
import { hideBattle } from "@/modules/battles/service";
import type { RouteParams } from "@/types/api";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(hideBattleSchema, body);
    const battle = await hideBattle(id, input);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
