import { prisma } from "@/lib/db";
import { ForbiddenError } from "@/lib/errors";
import type { CreateOpinionInput, GetOpinionsInput } from "./schema";

export async function createOpinion(
  userId: string,
  topicId: string,
  input: CreateOpinionInput
) {
  // Check if user has voted on this topic
  const vote = await prisma.vote.findUnique({
    where: {
      topicId_userId: { topicId, userId },
    },
  });

  if (!vote) {
    throw new ForbiddenError("투표를 먼저 해주세요. 투표한 측에서만 의견을 작성할 수 있습니다.");
  }

  return prisma.opinion.create({
    data: {
      topicId,
      userId,
      side: vote.side,
      body: input.body,
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          reactions: true,
        },
      },
    },
  });
}

export async function getOpinions(topicId: string, input: GetOpinionsInput) {
  const { side, sort, page, limit } = input;
  const skip = (page - 1) * limit;

  const where = {
    topicId,
    ...(side && { side }),
  };

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
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true,
            image: true,
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
