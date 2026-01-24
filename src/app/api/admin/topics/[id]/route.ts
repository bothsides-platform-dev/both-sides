import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { updateTopicSchema } from "@/modules/topics/schema";
import { getTopic, updateTopic, deleteTopic } from "@/modules/topics/service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const topic = await getTopic(id);
    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const input = await validateRequest(updateTopicSchema, body);
    const topic = await updateTopic(id, input);
    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteTopic(id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
