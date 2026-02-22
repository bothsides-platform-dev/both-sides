import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { getBattleForAdmin, deleteBattle } from "@/modules/battles/service";
import type { RouteParams } from "@/types/api";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const battle = await getBattleForAdmin(id);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteBattle(id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
