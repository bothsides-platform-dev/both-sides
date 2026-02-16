import { z } from "zod";

export const updateLlmSettingsSchema = z.object({
  provider: z.enum(["openai", "google"]),
  apiKey: z.string().min(20, "API 키는 최소 20자 이상이어야 합니다."),
  baseUrl: z.union([z.string().url(), z.literal("")]).optional(),
  modelSummarize: z.string().optional(),
  modelGenerate: z.string().optional(),
  isEnabled: z.boolean(),
  enableSummarize: z.boolean(),
  enableGenerate: z.boolean(),
  enableGrounds: z.boolean(),
  enableClassify: z.boolean(),
  timeoutMs: z.number().min(1000).max(120000),
});

export type UpdateLlmSettingsInput = z.infer<typeof updateLlmSettingsSchema>;

export const getLlmSettingsSchema = z.object({});

export type GetLlmSettingsInput = z.infer<typeof getLlmSettingsSchema>;
