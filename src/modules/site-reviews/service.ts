import { prisma } from "@/lib/db";
import type { CreateSiteReviewInput } from "./schema";

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
