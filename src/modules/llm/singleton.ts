import { createCore, type Core } from "./core";
import { getLlmSettings } from "@/modules/llm-settings/service";

const globalForLlm = globalThis as unknown as {
  llmCore: Core | undefined;
  llmCorePromise: Promise<Core> | undefined;
};

async function initializeCore(): Promise<Core> {
  if (globalForLlm.llmCore) return globalForLlm.llmCore;

  try {
    // Try database first
    const dbSettings = await getLlmSettings().catch(() => null);

    if (dbSettings?.isEnabled) {
      const core = createCore({
        openai: {
          apiKey: dbSettings.apiKey,
          baseUrl: dbSettings.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
          modelSummarize: dbSettings.modelSummarize || process.env.OPENAI_MODEL_SUMMARIZE || "gpt-4o-mini",
          modelGenerate: dbSettings.modelGenerate || process.env.OPENAI_MODEL_GENERATE || "gpt-4o-mini",
        },
        timeoutMs: dbSettings.timeoutMs || parseInt(process.env.LLM_TIMEOUT_MS || "30000", 10),
      });
      console.log("[LLM] Initialized with database configuration");

      if (process.env.NODE_ENV !== "production") globalForLlm.llmCore = core;
      return core;
    }
  } catch (err) {
    console.error("[LLM] Failed to load database settings, falling back to env vars:", err);
  }

  // Fallback to environment variables
  const core = createCore({
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? "",
      baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      modelSummarize: process.env.OPENAI_MODEL_SUMMARIZE ?? "gpt-4o-mini",
      modelGenerate: process.env.OPENAI_MODEL_GENERATE ?? "gpt-4o-mini",
    },
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS ?? "30000", 10),
  });
  console.log("[LLM] Initialized with environment variable configuration");

  if (process.env.NODE_ENV !== "production") globalForLlm.llmCore = core;
  return core;
}

export function getLlmCore(): Promise<Core> {
  if (!globalForLlm.llmCorePromise) {
    globalForLlm.llmCorePromise = initializeCore();
  }
  return globalForLlm.llmCorePromise;
}
