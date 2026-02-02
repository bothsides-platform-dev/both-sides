import { z } from "zod";

export const generateBotOpinionsSchema = z.object({
  topicId: z.string().min(1),
  countA: z.coerce.number().int().min(0).max(20),
  countB: z.coerce.number().int().min(0).max(20),
});

export const seedBotAccountsSchema = z.object({
  count: z.coerce.number().int().min(1).max(50),
});

export type GenerateBotOpinionsInput = z.infer<typeof generateBotOpinionsSchema>;
export type SeedBotAccountsInput = z.infer<typeof seedBotAccountsSchema>;
