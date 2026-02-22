import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { forceEndBattleSchema } from "@/modules/battles/schema";
import { forceEndBattle } from "@/modules/battles/service";
import type { RouteParams } from "@/types/api";

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(forceEndBattleSchema, body);
    const battle = await forceEndBattle(id, input);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
