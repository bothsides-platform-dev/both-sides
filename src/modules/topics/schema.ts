import { z } from "zod";
import { TOPIC_MAX_IMAGES } from "@/lib/constants";

const categoryEnum = z.enum(["DAILY", "POLITICS", "SOCIAL", "RELATIONSHIP", "HISTORY", "GAME", "TECH", "SPORTS"]);

const referenceLinkSchema = z.object({
  url: z.string().url("올바른 URL 형식이 아닙니다.").max(2000, "URL은 2000자 이하여야 합니다.")
    .refine((val) => /^https?:\/\//i.test(val), { message: "http 또는 https URL만 허용됩니다." }),
  title: z.string().max(100, "제목은 100자 이하여야 합니다.").optional(),
});

const imageUrlItem = z.string().refine(
  (val) => val.startsWith("/") || (z.string().url().safeParse(val).success && /^https?:\/\//i.test(val)),
  { message: "올바른 URL 형식이 아닙니다. (http/https 또는 내부 경로만 허용)" }
);

export const createTopicSchema = z.object({
  title: z.string().min(5, "제목은 5자 이상이어야 합니다.").max(100, "제목은 100자 이하여야 합니다."),
  description: z.string().max(1000, "설명은 1000자 이하여야 합니다.").optional(),
  optionA: z.string().min(1, "A 옵션을 입력해주세요.").max(30, "옵션은 30자 이하여야 합니다."),
  optionB: z.string().min(1, "B 옵션을 입력해주세요.").max(30, "옵션은 30자 이하여야 합니다."),
  category: categoryEnum,
  imageUrl: imageUrlItem.optional(),
  images: z.array(imageUrlItem).max(TOPIC_MAX_IMAGES).optional(),
  deadline: z.string().datetime().optional(),
  referenceLinks: z.array(referenceLinkSchema).optional().default([]),
  isAnonymous: z.boolean().default(false),
});

export const getTopicsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: categoryEnum.optional(),
  sort: z.enum(["latest", "popular"]).default("latest"),
  featured: z.coerce.boolean().optional(),
  exclude: z.string().optional(),
});

export const updateFeaturedSchema = z.object({
  isFeatured: z.boolean(),
});

// Admin schemas
export const updateTopicSchema = z.object({
  title: z.string().min(5, "제목은 5자 이상이어야 합니다.").max(100, "제목은 100자 이하여야 합니다.").optional(),
  description: z.string().max(1000, "설명은 1000자 이하여야 합니다.").optional().nullable(),
  optionA: z.string().min(1, "A 옵션을 입력해주세요.").max(30, "옵션은 30자 이하여야 합니다.").optional(),
  optionB: z.string().min(1, "B 옵션을 입력해주세요.").max(30, "옵션은 30자 이하여야 합니다.").optional(),
  category: categoryEnum.optional(),
  imageUrl: imageUrlItem.optional().nullable(),
  images: z.array(imageUrlItem).max(TOPIC_MAX_IMAGES).optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  referenceLinks: z.array(referenceLinkSchema).optional().nullable(),
  // SEO 필드
  metaTitle: z.string().max(60, "메타 타이틀은 60자 이하여야 합니다.").optional().nullable(),
  metaDescription: z.string().max(160, "메타 설명은 160자 이하여야 합니다.").optional().nullable(),
  ogImageUrl: z.string().url("올바른 URL 형식이 아닙니다.").optional().nullable()
    .or(z.literal("")),  // 빈 문자열도 허용
  // 예약 발행
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updateHiddenSchema = z.object({
  isHidden: z.boolean(),
});

export const updateTopicAnonymitySchema = z.object({
  isAnonymous: z.boolean(),
});

export const getTopicsAdminSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["hidden", "visible", "all", "scheduled"]).default("all"),
  search: z.string().optional(),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type GetTopicsInput = z.infer<typeof getTopicsSchema>;
export type UpdateFeaturedInput = z.infer<typeof updateFeaturedSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type UpdateHiddenInput = z.infer<typeof updateHiddenSchema>;
export type UpdateTopicAnonymityInput = z.infer<typeof updateTopicAnonymitySchema>;
export type GetTopicsAdminInput = z.infer<typeof getTopicsAdminSchema>;
