import { z } from "zod";
import { DURATION_OPTIONS, MAX_COMMENT_LENGTH } from "./constants";

export const createChallengeSchema = z.object({
  topicId: z.string().cuid("유효하지 않은 토론 ID입니다."),
  challengedId: z.string().cuid("유효하지 않은 사용자 ID입니다."),
  challengedOpinionId: z.string().cuid("유효하지 않은 의견 ID입니다.").optional(),
  challengerOpinionId: z.string().cuid("유효하지 않은 의견 ID입니다.").optional(),
  challengeMessage: z.string().max(500, "도발 메시지는 500자 이내여야 합니다.").optional(),
});
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;

export const respondChallengeSchema = z.object({
  accept: z.boolean(),
});
export type RespondChallengeInput = z.infer<typeof respondChallengeSchema>;

export const setupBattleSchema = z.object({
  durationSeconds: z.number().refine(
    (v) => (DURATION_OPTIONS as readonly number[]).includes(v),
    "유효하지 않은 배틀 시간입니다."
  ),
});
export type SetupBattleInput = z.infer<typeof setupBattleSchema>;

export const submitGroundSchema = z.object({
  content: z
    .string()
    .min(1, "근거를 입력해주세요.")
    .max(2000, "근거는 2000자 이내여야 합니다."),
});
export type SubmitGroundInput = z.infer<typeof submitGroundSchema>;

export const battleCommentSchema = z.object({
  content: z
    .string()
    .min(1, "댓글을 입력해주세요.")
    .max(MAX_COMMENT_LENGTH, `댓글은 ${MAX_COMMENT_LENGTH}자 이내여야 합니다.`),
});
export type BattleCommentInput = z.infer<typeof battleCommentSchema>;

export const getBattlesSchema = z.object({
  topicId: z.string().cuid().optional(),
  status: z.enum(["PENDING", "SETUP", "ACTIVE", "COMPLETED", "RESIGNED", "ABANDONED", "DECLINED", "EXPIRED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type GetBattlesInput = z.infer<typeof getBattlesSchema>;

// Admin schemas
export const getBattlesAdminSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["all", "active", "completed", "hidden"]).default("all"),
  search: z.string().optional(),
});
export type GetBattlesAdminInput = z.infer<typeof getBattlesAdminSchema>;

export const hideBattleSchema = z.object({
  isHidden: z.boolean(),
  reason: z.string().max(500, "사유는 500자 이내여야 합니다.").optional(),
});
export type HideBattleInput = z.infer<typeof hideBattleSchema>;

export const forceEndBattleSchema = z.object({
  reason: z.string().max(500, "사유는 500자 이내여야 합니다.").optional(),
});
export type ForceEndBattleInput = z.infer<typeof forceEndBattleSchema>;
