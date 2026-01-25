import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: Promise<{ id: string }>;
};

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

    const topic = await prisma.topic.update({
      where: { id },
      data: { isAnonymous },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            opinions: true,
          },
        },
      },
    });

    return Response.json({ data: topic });
  } catch (error) {
    return handleApiError(error);
  }
}
