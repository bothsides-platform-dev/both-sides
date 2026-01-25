import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updateOpinionAnonymitySchema } from "@/modules/opinions/schema";
import { updateOpinionAnonymity } from "@/modules/opinions/service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(updateOpinionAnonymitySchema, body);
    const opinion = await updateOpinionAnonymity(id, user.id, input);
    return Response.json({ data: opinion });
  } catch (error) {
    return handleApiError(error);
  }
}
