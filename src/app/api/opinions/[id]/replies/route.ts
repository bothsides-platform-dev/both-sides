import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createOpinionSchema } from "@/modules/opinions/schema";
import { createOpinion } from "@/modules/opinions/service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: parentId } = await params;
    const body = await request.json();
    const input = await validateRequest(createOpinionSchema, {
      ...body,
      parentId,
    });
    
    // Use empty string for topicId as it will be determined from parent
    const opinion = await createOpinion(user.id, "", input);
    return Response.json({ data: opinion }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
