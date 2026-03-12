import { z } from "zod";

export const createPostCommentSchema = z.object({
  body: z.string().min(1, "댓글을 입력해주세요.").max(1000, "댓글은 1000자 이하여야 합니다."),
  isAnonymous: z.boolean().default(false),
  parentId: z.string().optional(),
});

export const getPostCommentsSchema = z.object({
  sort: z.enum(["latest", "hot"]).default("latest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  parentId: z.string().optional().nullable(),
});

export type CreatePostCommentInput = z.infer<typeof createPostCommentSchema>;
export type GetPostCommentsInput = z.infer<typeof getPostCommentsSchema>;
