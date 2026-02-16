import { z } from "zod";

export const createSiteReviewSchema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(500, "코멘트는 500자 이하여야 합니다.").optional().or(z.literal("")),
  pathname: z.string().optional(),
});

export const getSiteReviewsSchema = z.object({
  scoreGroup: z.enum(["detractor", "passive", "promoter"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateSiteReviewInput = z.infer<typeof createSiteReviewSchema>;
export type GetSiteReviewsInput = z.infer<typeof getSiteReviewsSchema>;
