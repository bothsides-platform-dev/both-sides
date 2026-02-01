import { createOpenAiProvider } from "./providers/openai";
import { LlmProvider } from "./provider";
import {
  GenerateInput,
  GenerateOutput,
  SummarizeInput,
  SummarizeOutput,
  SummarizeOpinionsInput,
  SummarizeOpinionsOutput,
  SummarizeOpinionsResultSchema,
  AddOpinionInput,
  AddOpinionOutput,
  AddOpinionResultSchema
} from "./schemas";
import { ApiError } from "./errors";
import { buildSummarizeOpinionsPrompt } from "./prompts/summarize_opinions";
import { buildAddOpinionPrompt } from "./prompts/add_opinion";

export type CoreConfig = {
  provider: "openai";
  openai: {
    apiKey: string;
    baseUrl: string;
    modelSummarize: string;
    modelGenerate: string;
  };
  timeoutMs: number;
};

export type CoreConfigInput = Partial<Omit<CoreConfig, "openai">> & {
  openai?: Partial<CoreConfig["openai"]>;
};

const loadEnvConfig = (): CoreConfig => {
  return {
    provider: (process.env.LLM_PROVIDER as CoreConfig["provider"]) ?? "openai",
    openai: {
      apiKey: process.env.OPENAI_API_KEY ?? "",
      baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      modelSummarize: process.env.OPENAI_MODEL_SUMMARIZE ?? "gpt-4o-mini",
      modelGenerate: process.env.OPENAI_MODEL_GENERATE ?? "gpt-4o-mini"
    },
    timeoutMs: Number.parseInt(process.env.LLM_TIMEOUT_MS ?? "30000", 10)
  };
};

const mergeConfig = (envConfig: CoreConfig, input?: CoreConfigInput): CoreConfig => {
  return {
    provider: input?.provider ?? envConfig.provider,
    timeoutMs: input?.timeoutMs ?? envConfig.timeoutMs,
    openai: {
      apiKey: input?.openai?.apiKey ?? envConfig.openai.apiKey,
      baseUrl: input?.openai?.baseUrl ?? envConfig.openai.baseUrl,
      modelSummarize: input?.openai?.modelSummarize ?? envConfig.openai.modelSummarize,
      modelGenerate: input?.openai?.modelGenerate ?? envConfig.openai.modelGenerate
    }
  };
};

export const createCore = (input?: CoreConfigInput) => {
  const envConfig = loadEnvConfig();
  const config = mergeConfig(envConfig, input);

  if (config.provider === "openai" && !config.openai.apiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  let provider: LlmProvider;

  if (config.provider === "openai") {
    provider = createOpenAiProvider(config.openai);
  } else {
    throw new Error(`Unsupported provider: ${config.provider}`);
  }

  const summarize = (inputData: SummarizeInput): Promise<SummarizeOutput> => {
    return provider.summarize(inputData, { timeoutMs: config.timeoutMs });
  };

  const generate = (inputData: GenerateInput): Promise<GenerateOutput> => {
    return provider.generate(inputData, { timeoutMs: config.timeoutMs });
  };

  const extractJson = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith("```")) {
      const withoutFence = trimmed.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      return withoutFence;
    }
    if (!trimmed.startsWith("{")) {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start >= 0 && end > start) {
        return trimmed.slice(start, end + 1);
      }
    }
    return trimmed;
  };

  const replacePlaceholders = (prompt: string, replacements: Record<string, string>) => {
    let out = prompt;
    for (const [key, value] of Object.entries(replacements)) {
      out = out.split(key).join(value);
    }
    return out;
  };

  const buildSideSummaryFromGrounds = (
    label: string,
    groundsInput: unknown
  ): { label: string; summary: string; grounds: { title: string; points: string[] }[] } => {
    const groundsArray = Array.isArray(groundsInput) ? groundsInput : [];
    const mapped = groundsArray.slice(0, 5).map((g, idx) => {
      if (g && typeof g === "object" && "title" in g && "points" in g) {
        const title = String((g as { title?: unknown }).title ?? "").trim() || `Ground ${idx + 1}`;
        const pointsRaw = (g as { points?: unknown }).points;
        const points = Array.isArray(pointsRaw)
          ? pointsRaw.map((p) => String(p ?? "").trim()).filter(Boolean)
          : [];
        return {
          title,
          points: points.length > 0 ? points.slice(0, 5) : ["General support"]
        };
      }

      const summary =
        g && typeof g === "object" && "summary" in g
          ? String((g as { summary?: unknown }).summary ?? "").trim()
          : "";
      const rawTitle =
        g && typeof g === "object" && "id" in g
          ? `Ground ${(g as { id?: unknown }).id ?? idx + 1}`
          : "";
      const title = rawTitle || (summary ? summary.slice(0, 60) : `Ground ${idx + 1}`);

      return {
        title,
        points: [summary || "General support"]
      };
    });

    if (mapped.length === 0) {
      return { label, summary: "No opinions provided.", grounds: [] };
    }

    const summary = mapped
      .map((g) => g.points[0])
      .filter(Boolean)
      .slice(0, 3)
      .join(" ");

    return {
      label,
      summary: summary || "Summary unavailable.",
      grounds: mapped
    };
  };

  const summarizeOpinions = async (
    inputData: SummarizeOpinionsInput
  ): Promise<SummarizeOpinionsOutput> => {
    const opinionsForSide = inputData.opinions.filter((op) => op.side === inputData.targetSide);
    const basePrompt = buildSummarizeOpinionsPrompt({ ...inputData, opinions: opinionsForSide });
    const commentsJson = JSON.stringify(
      opinionsForSide.map((op, idx) => {
        const maybeId =
          op && typeof op === "object" && "id" in (op as Record<string, unknown>)
            ? String((op as Record<string, unknown>).id ?? "")
            : "";
        return { id: maybeId || String(idx + 1), text: op.body };
      })
    );
    const prompt = replacePlaceholders(basePrompt, { "{{COMMENTS_JSON}}": commentsJson });
    const generated = await provider.complete(
      { prompt, temperature: 0.2, maxTokens: 900 },
      { timeoutMs: config.timeoutMs }
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(generated.text));
    } catch {
      throw new ApiError("invalid_llm_response", "Invalid JSON from LLM", 502);
    }

    const validated = SummarizeOpinionsResultSchema.safeParse(parsed);
    if (validated.success) {
      return {
        sideA: { ...validated.data.sideA, label: inputData.topic.optionA },
        sideB: { ...validated.data.sideB, label: inputData.topic.optionB },
        model: generated.model,
        usage: generated.usage
      };
    }

    if (parsed && typeof parsed === "object" && "grounds" in parsed) {
      const targetLabel =
        inputData.targetSide === "A" ? inputData.topic.optionA : inputData.topic.optionB;
      const otherLabel =
        inputData.targetSide === "A" ? inputData.topic.optionB : inputData.topic.optionA;

      const targetSide = buildSideSummaryFromGrounds(
        targetLabel,
        (parsed as { grounds?: unknown }).grounds
      );
      const otherSide = buildSideSummaryFromGrounds(otherLabel, []);

      const result = {
        sideA: inputData.targetSide === "A" ? targetSide : otherSide,
        sideB: inputData.targetSide === "B" ? targetSide : otherSide
      };

      const normalized = SummarizeOpinionsResultSchema.safeParse(result);
      if (!normalized.success) {
        throw new ApiError("invalid_llm_response", "Unexpected LLM response format", 502, {
          issues: normalized.error.issues
        });
      }

      return {
        ...normalized.data,
        model: generated.model,
        usage: generated.usage
      };
    }

    throw new ApiError("invalid_llm_response", "Unexpected LLM response format", 502);
  };

  const addOpinion = async (inputData: AddOpinionInput): Promise<AddOpinionOutput> => {
    const basePrompt = buildAddOpinionPrompt(inputData);
    const prompt = replacePlaceholders(basePrompt, { "{{MAX_GROUNDS_TOTAL}}": "8" });
    const generated = await provider.complete(
      { prompt, temperature: 0.1, maxTokens: 300 },
      { timeoutMs: config.timeoutMs }
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(generated.text));
    } catch {
      throw new ApiError("invalid_llm_response", "Invalid JSON from LLM", 502);
    }

    const validated = AddOpinionResultSchema.safeParse(parsed);
    if (validated.success) {
      return {
        ...validated.data,
        model: generated.model,
        usage: generated.usage
      };
    }

    if (parsed && typeof parsed === "object" && "decision" in parsed) {
      const decision = (parsed as { decision?: unknown }).decision;
      const chosen = (parsed as { chosen_ground_id?: unknown }).chosen_ground_id;
      const newGround = (parsed as { new_ground?: { summary?: unknown } | null }).new_ground;
      const grounds =
        inputData.opinion.side === "A"
          ? inputData.opinionSummary.sideA.grounds
          : inputData.opinionSummary.sideB.grounds;

      let category = "Other";
      let confidence = 0.4;

      if (decision === "existing" && typeof chosen === "number" && Number.isFinite(chosen)) {
        const idx = Math.max(0, Math.floor(chosen) - 1);
        const title = grounds[idx]?.title;
        if (title) {
          category = title;
          confidence = 0.7;
        }
      } else if (decision === "new" && newGround && typeof newGround.summary === "string") {
        category = newGround.summary;
        confidence = 0.5;
      }

      const result = {
        side: inputData.opinion.side,
        category,
        confidence
      };

      const normalized = AddOpinionResultSchema.safeParse(result);
      if (!normalized.success) {
        throw new ApiError("invalid_llm_response", "Unexpected LLM response format", 502, {
          issues: normalized.error.issues
        });
      }

      return {
        ...normalized.data,
        model: generated.model,
        usage: generated.usage
      };
    }

    throw new ApiError("invalid_llm_response", "Unexpected LLM response format", 502);
  };

  return { summarize, generate, summarizeOpinions, addOpinion };
};

export type Core = ReturnType<typeof createCore>;
