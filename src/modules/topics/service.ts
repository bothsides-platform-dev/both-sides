import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { AUTHOR_SELECT, AUTHOR_SELECT_PUBLIC, TOPIC_COUNT_SELECT } from "@/lib/prisma-selects";

/** Rethrow Prisma P2025 (record not found) as NotFoundError */
function handlePrismaNotFound(e: unknown): never {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2025"
  ) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }
  throw e;
}
import { startOfMonth, endOfMonth } from "date-fns";
import type {
  CreateTopicInput,
  GetTopicsInput,
  UpdateFeaturedInput,
  UpdateTopicInput,
  UpdateHiddenInput,
  UpdateTopicAnonymityInput,
  GetTopicsAdminInput,
  GetScheduledTopicsForMonthInput,
} from "./schema";

export async function createTopic(authorId: string, input: CreateTopicInput) {
  const { deadline, images, scheduledAt, ...rest } = input;
  const imageUrl = images?.[0] ?? rest.imageUrl;
  return prisma.topic.create({
    data: {
      ...rest,
      imageUrl,
      images: images ? (images as Prisma.InputJsonValue) : undefined,
      deadline: deadline ? new Date(deadline) : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
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
    OR: [
      { scheduledAt: null },
      { scheduledAt: { lte: new Date() } },
    ],
  };
  if (category) where.category = category;
  if (featured !== undefined) where.isFeatured = featured;
  if (exclude) where.id = { not: exclude };

  const orderBy =
    sort === "popular"
      ? { viewCount: "desc" as const }
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
        images: true,
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
  const now = new Date();
  return prisma.topic.findMany({
    where: {
      isFeatured: true,
      isHidden: false,
      OR: [
        { scheduledAt: null },
        { scheduledAt: { lte: now } },
      ],
    },
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
      images: true,
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
  const now = new Date();
  return prisma.topic.findMany({
    where: {
      isFeatured: false,
      isHidden: false,
      AND: [
        {
          OR: [
            { deadline: null },
            { deadline: { gt: now } },
          ],
        },
        {
          OR: [
            { scheduledAt: null },
            { scheduledAt: { lte: now } },
          ],
        },
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
      images: true,
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
  try {
    return await prisma.topic.update({
      where: { id },
      data: {
        isFeatured: input.isFeatured,
        featuredAt: input.isFeatured ? new Date() : null,
      },
    });
  } catch (e) {
    handlePrismaNotFound(e);
  }
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
  } else if (status === "scheduled") {
    where.scheduledAt = { gt: new Date() };
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
  const { deadline, referenceLinks, images, metaTitle, metaDescription, ogImageUrl, scheduledAt, ...rest } = input;

  // images → imageUrl 자동 동기화
  let imageUrl = rest.imageUrl;
  if (images !== undefined) {
    imageUrl = images === null ? null : (images[0] ?? null);
  }

  try {
    return await prisma.topic.update({
      where: { id },
      data: {
        ...rest,
        imageUrl,
        images: images === null
          ? Prisma.JsonNull
          : images !== undefined
            ? (images as Prisma.InputJsonValue)
            : undefined,
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
        // 예약 발행
        scheduledAt: scheduledAt === null ? null : scheduledAt ? new Date(scheduledAt) : undefined,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        _count: { select: TOPIC_COUNT_SELECT },
      },
    });
  } catch (e) {
    handlePrismaNotFound(e);
  }
}

export async function updateHidden(id: string, input: UpdateHiddenInput) {
  try {
    return await prisma.topic.update({
      where: { id },
      data: {
        isHidden: input.isHidden,
        hiddenAt: input.isHidden ? new Date() : null,
      },
    });
  } catch (e) {
    handlePrismaNotFound(e);
  }
}

export async function deleteTopic(id: string) {
  try {
    return await prisma.topic.delete({ where: { id } });
  } catch (e) {
    handlePrismaNotFound(e);
  }
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

export async function getTopicsForLlmAdmin(input: {
  page: number;
  limit: number;
  filter?: "all" | "needs_summary" | "needs_grounds" | "complete";
  search?: string;
}) {
  const skip = (input.page - 1) * input.limit;

  const topics = await prisma.topic.findMany({
    where: {
      ...(input.search && {
        OR: [
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ],
      }),
    },
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
      _count: { select: { votes: true, opinions: true } },
      topicSummary: { select: { id: true } },
      groundsSummaries: { select: { side: true } },
    },
    skip,
    take: input.limit,
    orderBy: { createdAt: "desc" },
  });

  // Compute derived fields and apply filter
  const enrichedTopics = topics.map((t) => ({
    ...t,
    hasSummary: !!t.topicSummary,
    hasGroundsA: t.groundsSummaries.some((g) => g.side === "A"),
    hasGroundsB: t.groundsSummaries.some((g) => g.side === "B"),
    opinionCount: t._count.opinions,
    meetsMinimumForSummary: t._count.opinions >= 3,
    meetsMinimumForGrounds: t._count.opinions >= 10,
  }));

  // Apply filter
  const filtered = enrichedTopics.filter((t) => {
    if (!input.filter || input.filter === "all") return true;
    if (input.filter === "needs_summary")
      return !t.hasSummary && t.meetsMinimumForSummary;
    if (input.filter === "needs_grounds")
      return t.meetsMinimumForGrounds && (!t.hasGroundsA || !t.hasGroundsB);
    if (input.filter === "complete")
      return t.hasSummary && t.hasGroundsA && t.hasGroundsB;
    return true;
  });

  const total = filtered.length; // Note: This is approximate for filtered results

  return {
    topics: filtered,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
}

export async function getScheduledTopicsForMonth(input: GetScheduledTopicsForMonthInput) {
  const date = new Date(input.year, input.month - 1);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return prisma.topic.findMany({
    where: {
      scheduledAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      title: true,
      category: true,
      optionA: true,
      optionB: true,
      scheduledAt: true,
      createdAt: true,
      isHidden: true,
      author: { select: AUTHOR_SELECT },
    },
  });
}

/** 예약 발행: scheduledAt이 현재 시각 이전인 토픽의 scheduledAt을 null로 초기화합니다. */
export async function publishScheduledTopics() {
  const now = new Date();

  const topics = await prisma.topic.findMany({
    where: {
      scheduledAt: { lte: now },
    },
    select: { id: true, title: true, scheduledAt: true },
  });

  if (topics.length === 0) {
    return { published: 0, topics: [] };
  }

  await prisma.topic.updateMany({
    where: {
      scheduledAt: { lte: now },
    },
    data: { scheduledAt: null },
  });

  return {
    published: topics.length,
    topics: topics.map((t) => ({ id: t.id, title: t.title })),
  };
}
