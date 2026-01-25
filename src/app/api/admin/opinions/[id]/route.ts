import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const opinion = await prisma.opinion.findUnique({ where: { id } });

    if (!opinion) {
      throw new NotFoundError("의견을 찾을 수 없습니다.");
    }

    await prisma.opinion.delete({ where: { id } });

    return Response.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
