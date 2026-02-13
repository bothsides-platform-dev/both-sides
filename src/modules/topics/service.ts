import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { AUTHOR_SELECT, AUTHOR_SELECT_PUBLIC, TOPIC_COUNT_SELECT } from "@/lib/prisma-selects";
import type {
  CreateTopicInput,
  GetTopicsInput,
  UpdateFeaturedInput,
  UpdateTopicInput,
  UpdateHiddenInput,
  UpdateTopicAnonymityInput,
  GetTopicsAdminInput,
} from "./schema";

export async function createTopic(authorId: string, input: CreateTopicInput) {
  const { deadline, ...rest } = input;
  return prisma.topic.create({
    data: {
      ...rest,
      deadline: deadline ? new Date(deadline) : null,
      authorId,
    },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: TOPIC_COUNT_SELECT },
    },
  });
}

export async function getTopics(input: GetTopicsInput) {
  const { page, limit, category, sort, featured, exclude } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isHidden: false, // 공개된 토픽만 조회
  };
  if (category) where.category = category;
  if (featured !== undefined) where.isFeatured = featured;
  if (exclude) where.id = { not: exclude };

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
      select: {
        id: true,
        title: true,
        description: true,
        optionA: true,
        optionB: true,
        category: true,
        authorId: true,
        imageUrl: true,
        deadline: true,
        isFeatured: true,
        featuredAt: true,
        isHidden: true,
        hiddenAt: true,
        isAnonymous: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        author: { select: AUTHOR_SELECT },
        _count: { select: TOPIC_COUNT_SELECT },
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
    where: { isFeatured: true, isHidden: false },
    orderBy: { featuredAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      optionA: true,
      optionB: true,
      category: true,
      authorId: true,
      imageUrl: true,
      deadline: true,
      isFeatured: true,
      featuredAt: true,
      isHidden: true,
      hiddenAt: true,
      isAnonymous: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      author: { select: AUTHOR_SELECT_PUBLIC },
      _count: { select: TOPIC_COUNT_SELECT },
    },
  });
}

export async function getRecommendedTopics(limit: number = 6) {
  return prisma.topic.findMany({
    where: {
      isFeatured: false,
      isHidden: false,
      OR: [
        { deadline: null },
        { deadline: { gt: new Date() } },
      ],
    },
    orderBy: { votes: { _count: "desc" } },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      optionA: true,
      optionB: true,
      category: true,
      authorId: true,
      imageUrl: true,
      deadline: true,
      isFeatured: true,
      featuredAt: true,
      isHidden: true,
      hiddenAt: true,
      isAnonymous: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      author: { select: AUTHOR_SELECT_PUBLIC },
      _count: { select: TOPIC_COUNT_SELECT },
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
      author: { select: AUTHOR_SELECT },
      _count: { select: TOPIC_COUNT_SELECT },
    },
  });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  return topic;
}

export async function incrementViewCount(topicId: string) {
  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: { viewCount: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to increment view count", { topicId, error });
    return { success: false };
  }
}

// Admin functions
export async function getTopicsForAdmin(input: GetTopicsAdminInput) {
  const { page, limit, status, search } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status === "hidden") {
    where.isHidden = true;
  } else if (status === "visible") {
    where.isHidden = false;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [topics, total] = await Promise.all([
    prisma.topic.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: { select: AUTHOR_SELECT },
        _count: { select: TOPIC_COUNT_SELECT },
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

export async function updateTopic(id: string, input: UpdateTopicInput) {
  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  const { deadline, referenceLinks, metaTitle, metaDescription, ogImageUrl, ...rest } = input;

  return prisma.topic.update({
    where: { id },
    data: {
      ...rest,
      deadline: deadline === null ? null : deadline ? new Date(deadline) : undefined,
      referenceLinks: referenceLinks === null
        ? Prisma.JsonNull
        : referenceLinks !== undefined
          ? (referenceLinks as Prisma.InputJsonValue)
          : undefined,
      // SEO 필드: 빈 문자열이면 null로 변환
      metaTitle: metaTitle === "" ? null : metaTitle,
      metaDescription: metaDescription === "" ? null : metaDescription,
      ogImageUrl: ogImageUrl === "" ? null : ogImageUrl,
    },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: TOPIC_COUNT_SELECT },
    },
  });
}

export async function updateHidden(id: string, input: UpdateHiddenInput) {
  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  return prisma.topic.update({
    where: { id },
    data: {
      isHidden: input.isHidden,
      hiddenAt: input.isHidden ? new Date() : null,
    },
  });
}

export async function deleteTopic(id: string) {
  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  return prisma.topic.delete({ where: { id } });
}

export async function updateTopicAnonymity(id: string, userId: string, input: UpdateTopicAnonymityInput) {
  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  if (topic.authorId !== userId) {
    throw new ForbiddenError("본인의 토론만 수정할 수 있습니다.");
  }

  return prisma.topic.update({
    where: { id },
    data: { isAnonymous: input.isAnonymous },
    include: {
      author: { select: AUTHOR_SELECT },
      _count: { select: TOPIC_COUNT_SELECT },
    },
  });
}

export async function getAdminStats() {
  const [
    totalTopics,
    hiddenTopics,
    featuredTopics,
    totalVotes,
    totalOpinions,
    totalUsers,
    pendingReports,
  ] = await Promise.all([
    prisma.topic.count(),
    prisma.topic.count({ where: { isHidden: true } }),
    prisma.topic.count({ where: { isFeatured: true } }),
    prisma.vote.count(),
    prisma.opinion.count(),
    prisma.user.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalTopics,
    hiddenTopics,
    visibleTopics: totalTopics - hiddenTopics,
    featuredTopics,
    totalVotes,
    totalOpinions,
    totalUsers,
    pendingReports,
  };
}
