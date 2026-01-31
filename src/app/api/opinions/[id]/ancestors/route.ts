import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: opinionId } = await params;

    // Get the opinion and traverse up the parent chain
    const opinion = await prisma.opinion.findUnique({
      where: { id: opinionId },
      select: {
        id: true,
        parentId: true,
        side: true,
        topicId: true,
      },
    });

    if (!opinion) {
      return Response.json(
        { error: "의견을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Collect ancestor IDs by traversing up the parent chain
    const ancestorIds: string[] = [];
    let currentParentId = opinion.parentId;

    while (currentParentId) {
      ancestorIds.push(currentParentId);
      const parent = await prisma.opinion.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      currentParentId = parent?.parentId ?? null;
    }

    // The top-level opinion is the last one in the ancestor chain, or this opinion itself if no parent
    const topLevelOpinionId = ancestorIds.length > 0
      ? ancestorIds[ancestorIds.length - 1]
      : opinion.id;

    return Response.json({
      data: {
        ancestorIds,
        topLevelOpinionId,
        side: opinion.side,
        topicId: opinion.topicId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
