import { prisma } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { Side } from "@prisma/client";

interface VoteIdentifier {
  userId?: string;
  visitorId?: string;
  ipAddress?: string;
}

export async function upsertVote(
  identifier: VoteIdentifier,
  topicId: string,
  side: Side
) {
  // Check if topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  // Check if voting has ended
  if (topic.deadline && new Date() > topic.deadline) {
    throw new ForbiddenError("마감된 토론에는 투표할 수 없습니다.");
  }

  const { userId, visitorId, ipAddress } = identifier;
  const isLoggedIn = !!userId;

  if (isLoggedIn) {
    // Logged-in user: use upsert with topicId_userId unique constraint
    return prisma.vote.upsert({
      where: {
        vote_topic_user: { topicId, userId: userId! },
      },
      update: { side },
      create: { topicId, userId, side },
    });
  } else {
    // Guest user: find existing vote and update, or create new
    const existingVote = await prisma.vote.findFirst({
      where: {
        topicId,
        visitorId,
        ipAddress,
      },
    });

    if (existingVote) {
      // Update existing vote
      return prisma.vote.update({
        where: { id: existingVote.id },
        data: { side },
      });
    } else {
      // Create new vote
      return prisma.vote.create({
        data: {
          topicId,
          visitorId,
          ipAddress,
          side,
        },
      });
    }
  }
}

export async function getVote(identifier: VoteIdentifier, topicId: string) {
  const { userId, visitorId, ipAddress } = identifier;

  if (userId) {
    // Logged-in user
    return prisma.vote.findUnique({
      where: {
        vote_topic_user: { topicId, userId },
      },
    });
  } else {
    // Guest user
    return prisma.vote.findFirst({
      where: {
        topicId,
        visitorId,
        ipAddress,
      },
    });
  }
}

export async function getVoteStats(topicId: string) {
  // Use groupBy to fetch both counts in a single query
  const stats = await prisma.vote.groupBy({
    by: ["side"],
    where: { topicId },
    _count: true,
  });

  const aCount = stats.find((s) => s.side === "A")?._count ?? 0;
  const bCount = stats.find((s) => s.side === "B")?._count ?? 0;
  const total = aCount + bCount;

  return {
    aCount,
    bCount,
    total,
    aPercentage: total > 0 ? Math.round((aCount / total) * 100) : 50,
    bPercentage: total > 0 ? Math.round((bCount / total) * 100) : 50,
  };
}
