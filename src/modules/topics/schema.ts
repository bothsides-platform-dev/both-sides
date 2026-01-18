import { z } from "zod";

export const createTopicSchema = z.object({
  title: z.string().min(5, "제목은 5자 이상이어야 합니다.").max(100, "제목은 100자 이하여야 합니다."),
  description: z.string().max(500, "설명은 500자 이하여야 합니다.").optional(),
  optionA: z.string().min(1, "A 옵션을 입력해주세요.").max(50, "옵션은 50자 이하여야 합니다."),
  optionB: z.string().min(1, "B 옵션을 입력해주세요.").max(50, "옵션은 50자 이하여야 합니다."),
  category: z.enum(["DAILY", "POLITICS", "SOCIAL", "RELATIONSHIP", "HISTORY", "GAME", "TECH"]),
});

export const getTopicsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.enum(["DAILY", "POLITICS", "SOCIAL", "RELATIONSHIP", "HISTORY", "GAME", "TECH"]).optional(),
  sort: z.enum(["latest", "popular"]).default("latest"),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type GetTopicsInput = z.infer<typeof getTopicsSchema>;
