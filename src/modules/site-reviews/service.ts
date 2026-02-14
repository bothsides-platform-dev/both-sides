import { prisma } from "@/lib/db";
import type { CreateSiteReviewInput, GetSiteReviewsInput } from "./schema";

export async function createSiteReview(
  input: CreateSiteReviewInput,
  userId?: string,
  visitorId?: string
) {
  return prisma.siteReview.create({
    data: {
      score: input.score,
      comment: input.comment || null,
      pathname: input.pathname || null,
      userId: userId || null,
      visitorId: visitorId || null,
    },
  });
}

function scoreGroupToWhere(scoreGroup?: string) {
  switch (scoreGroup) {
    case "detractor":
      return { score: { lte: 6 } };
    case "passive":
      return { score: { gte: 7, lte: 8 } };
    case "promoter":
      return { score: { gte: 9 } };
    default:
      return {};
  }
}

export async function getSiteReviews(input: GetSiteReviewsInput) {
  const { scoreGroup, page, limit } = input;
  const skip = (page - 1) * limit;
  const where = scoreGroupToWhere(scoreGroup);

  const [reviews, total] = await Promise.all([
    prisma.siteReview.findMany({
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
          },
        },
      },
    }),
    prisma.siteReview.count({ where }),
  ]);

  return {
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getSiteReviewStats() {
  const [detractors, passives, promoters] = await Promise.all([
    prisma.siteReview.count({ where: { score: { lte: 6 } } }),
    prisma.siteReview.count({ where: { score: { gte: 7, lte: 8 } } }),
    prisma.siteReview.count({ where: { score: { gte: 9 } } }),
  ]);

  const total = detractors + passives + promoters;
  const npsScore =
    total > 0
      ? Math.round(((promoters - detractors) / total) * 100)
      : 0;

  const [avgResult] = await Promise.all([
    prisma.siteReview.aggregate({ _avg: { score: true } }),
  ]);

  return {
    detractors,
    passives,
    promoters,
    total,
    npsScore,
    avgScore: avgResult._avg.score ?? 0,
  };
}
