import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { CreateTopicInput, GetTopicsInput } from "./schema";

export async function createTopic(authorId: string, input: CreateTopicInput) {
  return prisma.topic.create({
    data: {
      ...input,
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
  const { page, limit, category, sort } = input;
  const skip = (page - 1) * limit;

  const where = category ? { category } : {};

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
