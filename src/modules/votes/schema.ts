import { z } from "zod";

// Legacy schema for backward compatibility with existing BINARY votes
export const upsertVoteSchema = z.object({
  side: z.enum(["A", "B"]),
});

// Type-specific schemas
export const upsertVoteBinarySchema = z.object({
  side: z.enum(["A", "B"]),
});

export const upsertVoteMultipleSchema = z.object({
  optionId: z.string().min(1, "옵션을 선택해주세요."),
});

export const upsertVoteNumericSchema = z.object({
  numericValue: z.number().int("정수만 입력 가능합니다."),
});

export type UpsertVoteInput = z.infer<typeof upsertVoteSchema>;
export type UpsertVoteBinaryInput = z.infer<typeof upsertVoteBinarySchema>;
export type UpsertVoteMultipleInput = z.infer<typeof upsertVoteMultipleSchema>;
export type UpsertVoteNumericInput = z.infer<typeof upsertVoteNumericSchema>;
