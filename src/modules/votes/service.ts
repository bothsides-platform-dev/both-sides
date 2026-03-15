import { prisma } from "@/lib/db";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { memoryCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import type { Side, TopicType } from "@prisma/client";

interface BinaryVoteStats {
  type: "BINARY";
  aCount: number;
  bCount: number;
  total: number;
  aPercentage: number;
  bPercentage: number;
}

interface MultipleVoteStats {
  type: "MULTIPLE";
  options: Array<{ id: string; label: string; count: number; percentage: number }>;
  total: number;
}

interface NumericVoteStats {
  type: "NUMERIC";
  average: number;
  median: number;
  min: number;
  max: number;
  total: number;
  distribution: Array<{ rangeLabel: string; count: number }>;
}

export type VoteStats = BinaryVoteStats | MultipleVoteStats | NumericVoteStats;

// Legacy interface for backward compat
interface LegacyVoteStats {
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

interface UpsertVoteData {
  side?: Side;
  optionId?: string;
  numericValue?: number;
}

export async function upsertVote(
  identifier: VoteIdentifier,
  topicId: string,
  data: UpsertVoteData
) {
  // Check if topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true, topicType: true, deadline: true, numericMin: true, numericMax: true },
  });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  // Check if voting has ended
  if (topic.deadline && new Date() > topic.deadline) {
    throw new ForbiddenError("마감된 토론에는 투표할 수 없습니다.");
  }

  // Validate vote data based on topic type
  if (topic.topicType === "BINARY") {
    if (!data.side) throw new ForbiddenError("투표 선택지를 선택해주세요.");
  } else if (topic.topicType === "MULTIPLE") {
    if (!data.optionId) throw new ForbiddenError("옵션을 선택해주세요.");
    // Validate option exists for this topic
    const option = await prisma.topicOption.findFirst({
      where: { id: data.optionId, topicId },
    });
    if (!option) throw new NotFoundError("유효하지 않은 옵션입니다.");
  } else if (topic.topicType === "NUMERIC") {
    if (data.numericValue == null) throw new ForbiddenError("숫자를 입력해주세요.");
    if (topic.numericMin != null && data.numericValue < topic.numericMin) {
      throw new ForbiddenError(`최소값은 ${topic.numericMin}입니다.`);
    }
    if (topic.numericMax != null && data.numericValue > topic.numericMax) {
      throw new ForbiddenError(`최대값은 ${topic.numericMax}입니다.`);
    }
  }

  const { userId, visitorId, ipAddress, fingerprint } = identifier;
  const isLoggedIn = !!userId;

  const voteData = {
    side: data.side || null,
    optionId: data.optionId || null,
    numericValue: data.numericValue ?? null,
  };

  let result;

  if (isLoggedIn) {
    result = await prisma.vote.upsert({
      where: {
        vote_topic_user: { topicId, userId: userId! },
      },
      update: voteData,
      create: { topicId, userId, ...voteData },
    });
  } else {
    const existingVote = await prisma.vote.findFirst({
      where: {
        topicId,
        OR: [
          ...(fingerprint ? [{ fingerprint }] : []),
          { visitorId, ipAddress },
        ],
      },
    });

    if (existingVote) {
      result = await prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          ...voteData,
          ...(fingerprint && { fingerprint }),
        },
      });
    } else {
      result = await prisma.vote.create({
        data: {
          topicId,
          visitorId,
          ipAddress,
          fingerprint,
          ...voteData,
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
    return prisma.vote.findUnique({
      where: {
        vote_topic_user: { topicId, userId },
      },
    });
  } else {
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

  // Get topic type
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { topicType: true, numericUnit: true, numericMin: true, numericMax: true },
  });

  if (!topic) {
    // Fallback for missing topic
    return { type: "BINARY", aCount: 0, bCount: 0, total: 0, aPercentage: 50, bPercentage: 50 };
  }

  let result: VoteStats;

  if (topic.topicType === "MULTIPLE") {
    result = await getMultipleVoteStats(topicId);
  } else if (topic.topicType === "NUMERIC") {
    result = await getNumericVoteStats(topicId, topic);
  } else {
    result = await getBinaryVoteStats(topicId);
  }

  memoryCache.set(cacheKey, result, CACHE_TTL.VOTE_STATS);
  return result;
}

async function getBinaryVoteStats(topicId: string): Promise<BinaryVoteStats> {
  const stats = await prisma.vote.groupBy({
    by: ["side"],
    where: { topicId },
    _count: true,
  });

  const aCount = stats.find((s) => s.side === "A")?._count ?? 0;
  const bCount = stats.find((s) => s.side === "B")?._count ?? 0;
  const total = aCount + bCount;

  return {
    type: "BINARY",
    aCount,
    bCount,
    total,
    aPercentage: total > 0 ? Math.round((aCount / total) * 100) : 50,
    bPercentage: total > 0 ? Math.round((bCount / total) * 100) : 50,
  };
}

async function getMultipleVoteStats(topicId: string): Promise<MultipleVoteStats> {
  const [topicOptions, voteCounts] = await Promise.all([
    prisma.topicOption.findMany({
      where: { topicId },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.vote.groupBy({
      by: ["optionId"],
      where: { topicId, optionId: { not: null } },
      _count: true,
    }),
  ]);

  const total = voteCounts.reduce((sum, v) => sum + v._count, 0);

  const options = topicOptions.map((opt) => {
    const count = voteCounts.find((v) => v.optionId === opt.id)?._count ?? 0;
    return {
      id: opt.id,
      label: opt.label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return { type: "MULTIPLE", options, total };
}

async function getNumericVoteStats(
  topicId: string,
  topic: { numericMin: number | null; numericMax: number | null }
): Promise<NumericVoteStats> {
  const votes = await prisma.vote.findMany({
    where: { topicId, numericValue: { not: null } },
    select: { numericValue: true },
    orderBy: { numericValue: "asc" },
  });

  const values = votes.map((v) => v.numericValue!);
  const total = values.length;

  if (total === 0) {
    return { type: "NUMERIC", average: 0, median: 0, min: 0, max: 0, total: 0, distribution: [] };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const average = Math.round(sum / total);
  const median = total % 2 === 0
    ? Math.round((values[total / 2 - 1] + values[total / 2]) / 2)
    : values[Math.floor(total / 2)];
  const min = values[0];
  const max = values[total - 1];

  // Build distribution (5 buckets)
  const bucketMin = topic.numericMin ?? min;
  const bucketMax = topic.numericMax ?? max;
  const range = bucketMax - bucketMin;
  const bucketCount = 5;
  const bucketSize = range > 0 ? Math.ceil(range / bucketCount) : 1;

  const distribution: Array<{ rangeLabel: string; count: number }> = [];
  for (let i = 0; i < bucketCount; i++) {
    const lo = bucketMin + i * bucketSize;
    const hi = i === bucketCount - 1 ? bucketMax : lo + bucketSize - 1;
    const count = values.filter((v) => v >= lo && v <= hi).length;
    distribution.push({ rangeLabel: `${lo}~${hi}`, count });
  }

  return { type: "NUMERIC", average, median, min, max, total, distribution };
}

/**
 * Invalidate vote stats cache for a topic
 * Call this after a vote is cast or updated
 */
export function invalidateVoteStatsCache(topicId: string): void {
  const cacheKey = CACHE_KEYS.VOTE_STATS(topicId);
  memoryCache.delete(cacheKey);
}
