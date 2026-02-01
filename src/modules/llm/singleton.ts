import { createCore, type Core } from "./core";

const globalForLlm = globalThis as unknown as { llmCore: Core | undefined };

export function getLlmCore(): Core {
  if (globalForLlm.llmCore) return globalForLlm.llmCore;

  const core = createCore({
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? "",
      modelSummarize: process.env.OPENAI_MODEL_SUMMARIZE ?? "gpt-4o-mini",
      modelGenerate: process.env.OPENAI_MODEL_GENERATE ?? "gpt-4o-mini",
    },
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS ?? "30000", 10),
  });

  if (process.env.NODE_ENV !== "production") globalForLlm.llmCore = core;

  return core;
}
