import { z } from "zod";

export const SummarizeRequestSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(0).max(2000),
  maxLength: z.number().int().min(20).max(2000).optional().default(200),
  style: z.enum(["neutral", "friendly", "formal"]).optional().default("neutral")
});

export const TopicSchema = z.object({
  title: z.string().min(1).max(300),
  body: z.string().min(0).max(2000),
  summary: z.string().min(0).max(2000).optional(),
  optionA: z.string().min(1).max(200),
  optionB: z.string().min(1).max(200),
});

export const SideSchema = z.enum(["A", "B"]);

export const GenerateRequestSchema = z.object({
  topic: TopicSchema,
  side: SideSchema,
  // style field removed - no longer needed after prompt update
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().min(1).max(2048).optional().default(256)
});

export const OpinionInputSchema = z.object({
  side: SideSchema,
  body: z.string().min(1).max(200000)
});

export const SummarizeOpinionsRequestSchema = z.object({
  topic: TopicSchema,
  targetSide: SideSchema,
  opinions: z.array(OpinionInputSchema).min(1).max(500)
});

export type SummarizeInput = z.input<typeof SummarizeRequestSchema>;
export type GenerateInput = z.input<typeof GenerateRequestSchema>;
export type SummarizeOpinionsInput = z.infer<typeof SummarizeOpinionsRequestSchema>;

export type CompleteInput = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
};

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  costUsd: number | null;
};

export type SummarizeOutput = {
  summary: string;
  model: string;
  usage: Usage;
};

export type GenerateOutput = {
  text: string;
  model: string;
  usage: Usage;
};

export const GroundSchema = z.object({
  title: z.string().min(1).max(80),
  points: z.array(z.string().min(1).max(300)).min(1).max(5)
});

export const SideSummarySchema = z.object({
  label: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  grounds: z.array(GroundSchema).max(5)
});

export const SummarizeOpinionsResultSchema = z.object({
  sideA: SideSummarySchema,
  sideB: SideSummarySchema
});

export type SummarizeOpinionsResult = z.infer<typeof SummarizeOpinionsResultSchema>;

export type SummarizeOpinionsOutput = SummarizeOpinionsResult & {
  model: string;
  usage: Usage;
};

export const AddOpinionRequestSchema = z.object({
  topic: TopicSchema,
  opinionSummary: SummarizeOpinionsResultSchema,
  opinion: OpinionInputSchema
});

export type AddOpinionInput = z.infer<typeof AddOpinionRequestSchema>;

export const AddOpinionResultSchema = z.object({
  side: SideSchema,
  category: z.string().min(1).max(80),
  confidence: z.number().min(0).max(1)
});

export type AddOpinionResult = z.infer<typeof AddOpinionResultSchema>;

export type AddOpinionOutput = AddOpinionResult & {
  model: string;
  usage: Usage;
};
