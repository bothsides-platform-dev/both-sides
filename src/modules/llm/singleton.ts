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
      const config = {
        openai: {
          apiKey: dbSettings.apiKey,
          baseUrl: dbSettings.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
          modelSummarize: dbSettings.modelSummarize || process.env.OPENAI_MODEL_SUMMARIZE || "gpt-4o-mini",
          modelGenerate: dbSettings.modelGenerate || process.env.OPENAI_MODEL_GENERATE || "gpt-4o-mini",
          modelGrounds: dbSettings.modelGrounds || process.env.OPENAI_MODEL_GROUNDS || "gpt-4o",
        },
        timeoutMs: dbSettings.timeoutMs || parseInt(process.env.LLM_TIMEOUT_MS || "30000", 10),
      };

      console.log("[LLM] Initializing with database configuration:", {
        baseUrl: config.openai.baseUrl,
        modelSummarize: config.openai.modelSummarize,
        modelGenerate: config.openai.modelGenerate,
        modelGrounds: config.openai.modelGrounds,
        hasApiKey: !!config.openai.apiKey,
      });

      const core = createCore(config);
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
      modelGrounds: process.env.OPENAI_MODEL_GROUNDS ?? "gpt-4o",
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
