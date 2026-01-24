import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { CreateTopicInput, GetTopicsInput, UpdateFeaturedInput } from "./schema";

export async function createTopic(authorId: string, input: CreateTopicInput) {
  const { deadline, ...rest } = input;
  return prisma.topic.create({
    data: {
      ...rest,
      deadline: deadline ? new Date(deadline) : null,
      authorId,
    },
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
}

export async function getTopics(input: GetTopicsInput) {
  const { page, limit, category, sort, featured } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (featured !== undefined) where.isFeatured = featured;

  const orderBy =
    sort === "popular"
      ? { votes: { _count: "desc" as const } }
      : { createdAt: "desc" as const };

  const [topics, total] = await Promise.all([
    prisma.topic.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    }),
    prisma.topic.count({ where }),
  ]);

  return {
    topics,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFeaturedTopics(limit: number = 2) {
  return prisma.topic.findMany({
    where: { isFeatured: true },
    orderBy: { featuredAt: "desc" },
    take: limit,
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
}

export async function getRecommendedTopics(limit: number = 6) {
  return prisma.topic.findMany({
    where: { isFeatured: false },
    orderBy: { votes: { _count: "desc" } },
    take: limit,
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
}

export async function updateFeatured(id: string, input: UpdateFeaturedInput) {
  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  return prisma.topic.update({
    where: { id },
    data: {
      isFeatured: input.isFeatured,
      featuredAt: input.isFeatured ? new Date() : null,
    },
  });
}

export async function getTopic(id: string) {
  const topic = await prisma.topic.findUnique({
    where: { id },
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

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  return topic;
}

export async function getVoteStats(topicId: string) {
  const [aCount, bCount] = await Promise.all([
    prisma.vote.count({ where: { topicId, side: "A" } }),
    prisma.vote.count({ where: { topicId, side: "B" } }),
  ]);

  const total = aCount + bCount;

  return {
    aCount,
    bCount,
    total,
    aPercentage: total > 0 ? Math.round((aCount / total) * 100) : 50,
    bPercentage: total > 0 ? Math.round((bCount / total) * 100) : 50,
  };
}

export async function incrementViewCount(topicId: string, visitorId: string) {
  // 이미 조회한 적이 있는지 확인
  const existingView = await prisma.topicView.findUnique({
    where: {
      topicId_visitorId: { topicId, visitorId },
    },
  });

  if (existingView) {
    return { success: false, alreadyViewed: true };
  }

  // 트랜잭션으로 조회 기록 생성 + 카운트 증가
  try {
    await prisma.$transaction([
      prisma.topicView.create({
        data: { topicId, visitorId },
      }),
      prisma.topic.update({
        where: { id: topicId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return { success: true };
  } catch {
    // 동시성 문제로 인한 중복 생성 시도 등 에러 무시
    return { success: false };
  }
}
