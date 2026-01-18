import { z } from "zod";

export const createOpinionSchema = z.object({
  body: z.string().min(10, "의견은 10자 이상이어야 합니다.").max(1000, "의견은 1000자 이하여야 합니다."),
});

export const getOpinionsSchema = z.object({
  side: z.enum(["A", "B"]).optional(),
  sort: z.enum(["latest", "hot"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateOpinionInput = z.infer<typeof createOpinionSchema>;
export type GetOpinionsInput = z.infer<typeof getOpinionsSchema>;
