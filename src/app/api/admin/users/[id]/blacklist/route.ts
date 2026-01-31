import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { blacklistUserSchema } from "@/modules/users/schema";
import { blacklistUser, unblacklistUser } from "@/modules/users/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { reason } = await validateRequest(blacklistUserSchema, body);

    const user = await blacklistUser(id, reason);
    return Response.json({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await unblacklistUser(id);
    return Response.json({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}
