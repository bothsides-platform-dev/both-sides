import { z } from "zod";

export const createFeedbackSchema = z.object({
  category: z.enum(["BUG", "SUGGESTION", "QUESTION", "OTHER"]),
  content: z
    .string()
    .min(10, "내용은 10자 이상이어야 합니다.")
    .max(2000, "내용은 2000자 이하여야 합니다."),
  email: z.string().email("올바른 이메일 형식이 아닙니다.").optional().or(z.literal("")),
});

export const getFeedbacksSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "RESOLVED"]).optional(),
  category: z.enum(["BUG", "SUGGESTION", "QUESTION", "OTHER"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateFeedbackSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "REVIEWED", "RESOLVED"]).optional(),
  adminNote: z.string().max(2000, "메모는 2000자 이하여야 합니다.").optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type GetFeedbacksInput = z.infer<typeof getFeedbacksSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
