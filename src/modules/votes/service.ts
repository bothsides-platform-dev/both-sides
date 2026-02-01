import { prisma } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { memoryCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import type { Side } from "@prisma/client";

interface VoteStats {
  aCount: number;
  bCount: number;
  total: number;
  aPercentage: number;
  bPercentage: number;
}

interface VoteIdentifier {
  userId?: string;
  visitorId?: string;
  ipAddress?: string;
  fingerprint?: string;
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

  const { userId, visitorId, ipAddress, fingerprint } = identifier;
  const isLoggedIn = !!userId;

  let result;

  if (isLoggedIn) {
    // Logged-in user: use upsert with topicId_userId unique constraint
    result = await prisma.vote.upsert({
      where: {
        vote_topic_user: { topicId, userId: userId! },
      },
      update: { side },
      create: { topicId, userId, side },
    });
  } else {
    // Guest user: find existing vote by fingerprint OR (visitorId + ipAddress)
    const existingVote = await prisma.vote.findFirst({
      where: {
        topicId,
        OR: [
          // Fingerprint match (strongest identifier)
          ...(fingerprint ? [{ fingerprint }] : []),
          // Fallback to visitorId + ipAddress
          { visitorId, ipAddress },
        ],
      },
    });

    if (existingVote) {
      // Update existing vote and also update fingerprint if available
      result = await prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          side,
          ...(fingerprint && { fingerprint }),
        },
      });
    } else {
      // Create new vote
      result = await prisma.vote.create({
        data: {
          topicId,
          visitorId,
          ipAddress,
          fingerprint,
          side,
        },
      });
    }
  }

  // Invalidate vote stats cache after vote change
  invalidateVoteStatsCache(topicId);

  return result;
}

export async function getVote(identifier: VoteIdentifier, topicId: string) {
  const { userId, visitorId, ipAddress, fingerprint } = identifier;

  if (userId) {
    // Logged-in user
    return prisma.vote.findUnique({
      where: {
        vote_topic_user: { topicId, userId },
      },
    });
  } else {
    // Guest user: check fingerprint OR (visitorId + ipAddress)
    return prisma.vote.findFirst({
      where: {
        topicId,
        OR: [
          ...(fingerprint ? [{ fingerprint }] : []),
          { visitorId, ipAddress },
        ],
      },
    });
  }
}

export async function getVoteStats(topicId: string): Promise<VoteStats> {
  const cacheKey = CACHE_KEYS.VOTE_STATS(topicId);

  // Check cache first
  const cached = memoryCache.get<VoteStats>(cacheKey);
  if (cached) {
    return cached;
  }

  // Use groupBy to fetch both counts in a single query
  const stats = await prisma.vote.groupBy({
    by: ["side"],
    where: { topicId },
    _count: true,
  });

  const aCount = stats.find((s) => s.side === "A")?._count ?? 0;
  const bCount = stats.find((s) => s.side === "B")?._count ?? 0;
  const total = aCount + bCount;

  const result: VoteStats = {
    aCount,
    bCount,
    total,
    aPercentage: total > 0 ? Math.round((aCount / total) * 100) : 50,
    bPercentage: total > 0 ? Math.round((bCount / total) * 100) : 50,
  };

  // Cache the result
  memoryCache.set(cacheKey, result, CACHE_TTL.VOTE_STATS);

  return result;
}

/**
 * Invalidate vote stats cache for a topic
 * Call this after a vote is cast or updated
 */
export function invalidateVoteStatsCache(topicId: string): void {
  const cacheKey = CACHE_KEYS.VOTE_STATS(topicId);
  memoryCache.delete(cacheKey);
}
