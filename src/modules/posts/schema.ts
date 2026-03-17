import { z } from "zod";
import { TOPIC_MAX_IMAGES } from "@/lib/constants";

const categoryEnum = z.enum(["DAILY", "POLITICS", "SOCIAL", "RELATIONSHIP", "HISTORY", "GAME", "TECH", "SPORTS", "HUMOR"]);

const imageUrlItem = z.string().refine(
  (val) => val.startsWith("/") || (z.string().url().safeParse(val).success && /^https?:\/\//i.test(val)),
  { message: "올바른 URL 형식이 아닙니다." }
);

const videoUrlItem = z.string().url("올바른 URL 형식이 아닙니다.").refine(
  (val) =>
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(val) ||
    /^https?:\/\/(www\.)?vimeo\.com\//i.test(val),
  { message: "YouTube 또는 Vimeo URL만 허용됩니다." }
);

export const createPostSchema = z.object({
  title: z.string().min(2, "제목은 2자 이상이어야 합니다.").max(100, "제목은 100자 이하여야 합니다."),
  body: z.string().min(1, "내용을 입력해주세요.").max(50000, "내용은 50000자 이하여야 합니다."),
  category: categoryEnum,
  images: z.array(imageUrlItem).max(TOPIC_MAX_IMAGES).optional(),
  videoUrls: z.array(videoUrlItem).max(5).optional(),
  isAnonymous: z.boolean().default(false),
});

export const getPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: categoryEnum.optional(),
  sort: z.enum(["latest", "popular"]).default("latest"),
});

export const getPostsAdminSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["all", "visible", "hidden"]).default("all"),
  category: categoryEnum.optional(),
  search: z.string().optional(),
});

export const updatePostHiddenSchema = z.object({
  isHidden: z.boolean(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type GetPostsInput = z.infer<typeof getPostsSchema>;
export type GetPostsAdminInput = z.infer<typeof getPostsAdminSchema>;
