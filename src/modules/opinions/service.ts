import { prisma } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { CreateOpinionInput, GetOpinionsInput, UpdateOpinionAnonymityInput, GetOpinionsAdminInput } from "./schema";

export async function createOpinion(
  userId: string,
  topicId: string,
  input: CreateOpinionInput
) {
  let actualTopicId = topicId;
  let parentOpinion = null;

  // If creating a reply, get parent opinion info
  if (input.parentId) {
    parentOpinion = await prisma.opinion.findUnique({
      where: { id: input.parentId },
      select: { id: true, topicId: true },
    });

    if (!parentOpinion) {
      throw new NotFoundError("답글을 달 의견을 찾을 수 없습니다.");
    }

    // Use parent's topicId
    actualTopicId = parentOpinion.topicId;
  }

  // Check if user has voted on this topic
  const vote = await prisma.vote.findUnique({
    where: {
      vote_topic_user: { topicId: actualTopicId, userId },
    },
  });

  if (!vote) {
    throw new ForbiddenError("투표를 먼저 해주세요. 투표한 측에서만 의견을 작성할 수 있습니다.");
  }

  return prisma.opinion.create({
    data: {
      topicId: actualTopicId,
      userId,
      side: vote.side,
      body: input.body,
      isAnonymous: input.isAnonymous ?? false,
      parentId: input.parentId || null,
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
          isBlacklisted: true,
        },
      },
      _count: {
        select: {
          reactions: true,
          replies: true,
        },
      },
    },
  });
}

export async function getOpinions(topicId: string, input: GetOpinionsInput) {
  const { side, sort, page, limit, parentId } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    topicId,
    ...(side && { side }),
  };

  // Handle parentId filtering
  if (parentId !== undefined) {
    where.parentId = parentId;
  }

  // For "hot" sort, we need to include reaction counts
  const orderBy =
    sort === "hot"
      ? { reactions: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const [opinions, total] = await Promise.all([
    prisma.opinion.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        topicId: true,
        userId: true,
        side: true,
        body: true,
        isBlinded: true,
        isAnonymous: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            name: true,
            image: true,
            isBlacklisted: true,
          },
        },
        reactions: {
          select: {
            id: true,
            userId: true,
            type: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            reports: true,
            replies: true,
          },
        },
      },
    }),
    prisma.opinion.count({ where }),
  ]);

  // Process opinions to add reaction summary
  const processedOpinions = opinions.map((opinion) => {
    const likes = opinion.reactions.filter((r) => r.type === "LIKE").length;
    const dislikes = opinion.reactions.filter((r) => r.type === "DISLIKE").length;

    return {
      ...opinion,
      reactionSummary: {
        likes,
        dislikes,
      },
    };
  });

  return {
    opinions: processedOpinions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getOpinionById(id: string) {
  const opinion = await prisma.opinion.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
          isBlacklisted: true,
        },
      },
    },
  });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  return opinion;
}

export async function updateOpinionAnonymity(id: string, userId: string, input: UpdateOpinionAnonymityInput) {
  const opinion = await getOpinionById(id);

  if (opinion.userId !== userId) {
    throw new ForbiddenError("본인의 의견만 수정할 수 있습니다.");
  }

  return prisma.opinion.update({
    where: { id },
    data: { isAnonymous: input.isAnonymous },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
          isBlacklisted: true,
        },
      },
      reactions: {
        select: {
          id: true,
          userId: true,
          type: true,
        },
      },
      _count: {
        select: {
          reactions: true,
          reports: true,
          replies: true,
        },
      },
    },
  });
}

// Admin functions
export async function getOpinionsForAdmin(input: GetOpinionsAdminInput) {
  const { page, limit, search, topicId, isBlinded } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (topicId) {
    where.topicId = topicId;
  }

  if (isBlinded !== undefined) {
    where.isBlinded = isBlinded;
  }

  if (search) {
    where.OR = [
      { body: { contains: search, mode: "insensitive" } },
      { user: { nickname: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [opinions, total] = await Promise.all([
    prisma.opinion.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true,
            image: true,
            isBlacklisted: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            reports: true,
          },
        },
      },
    }),
    prisma.opinion.count({ where }),
  ]);

  return {
    opinions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateOpinionAnonymityByAdmin(id: string, isAnonymous: boolean) {
  const opinion = await prisma.opinion.findUnique({ where: { id } });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  return prisma.opinion.update({
    where: { id },
    data: { isAnonymous },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
          isBlacklisted: true,
        },
      },
      topic: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          reactions: true,
          reports: true,
        },
      },
    },
  });
}
