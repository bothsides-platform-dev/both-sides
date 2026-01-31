import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updateUserNicknameAdminSchema } from "@/modules/users/schema";
import { updateUserNicknameByAdmin } from "@/modules/users/service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { nickname } = await validateRequest(updateUserNicknameAdminSchema, body);

    const user = await updateUserNicknameByAdmin(id, nickname);
    return Response.json({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}
