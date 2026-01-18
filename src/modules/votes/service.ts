import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { Side } from "@prisma/client";

export async function upsertVote(userId: string, topicId: string, side: Side) {
  // Check if topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  // Upsert vote
  return prisma.vote.upsert({
    where: {
      topicId_userId: { topicId, userId },
    },
    update: { side },
    create: { topicId, userId, side },
  });
}

export async function getUserVote(userId: string, topicId: string) {
  return prisma.vote.findUnique({
    where: {
      topicId_userId: { topicId, userId },
    },
  });
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
