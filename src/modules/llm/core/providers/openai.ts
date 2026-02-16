import { buildGenerateMessages } from "../prompts/generate";
import { buildSummarizeTopic } from "../prompts/summarize_topic";
import { ApiError } from "../errors";
import { CallOpts, LlmProvider } from "../provider";
import { CompleteInput, GenerateInput, GenerateOutput, SummarizeInput, SummarizeOutput } from "../schemas";
import { retry } from "../retry";
import { toUsage } from "../usage";

export type OpenAiConfig = {
  apiKey: string;
  baseUrl: string;
  modelSummarize: string;
  modelGenerate: string;
};

type OpenAiChatResponse = {
  id: string;
  model: string;
  choices: Array<{ message: { content: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

const isTransientStatus = (status: number) => status === 429 || status >= 500;

const buildChatUrl = (baseUrl: string) => {
  return new URL("/chat/completions", baseUrl).toString();
};

export const createOpenAiProvider = (config: OpenAiConfig): LlmProvider => {
  const callChat = async (payload: Record<string, unknown>, opts: CallOpts) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);

    try {
      const chatUrl = buildChatUrl(config.baseUrl);
      console.log("[OpenAI] Calling API:", {
        url: chatUrl,
        baseUrl: config.baseUrl,
        hasApiKey: !!config.apiKey,
        keyPrefix: config.apiKey.substring(0, 10) + "...",
      });

      const res = await fetch(chatUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: "Unknown error" }));
        const errorMessage = errorBody?.error?.message || JSON.stringify(errorBody);

        if (isTransientStatus(res.status)) {
          throw new ApiError(
            "upstream_unavailable",
            `LLM provider unavailable: ${errorMessage}`,
            res.status,
            errorBody
          );
        }

        // Provide specific error message for 404
        if (res.status === 404) {
          throw new ApiError(
            "upstream_error",
            `OpenAI API endpoint not found (404). Check OPENAI_BASE_URL and API key validity. Error: ${errorMessage}`,
            res.status,
            errorBody
          );
        }

        throw new ApiError(
          "upstream_error",
          `LLM provider error (${res.status}): ${errorMessage}`,
          res.status,
          errorBody
        );
      }

      return (await res.json()) as OpenAiChatResponse;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError("upstream_network", "LLM network error", 502);
    } finally {
      clearTimeout(timeout);
    }
  };

  const callWithRetry = async (payload: Record<string, unknown>, opts: CallOpts) => {
    return retry(() => callChat(payload, opts), {
      retries: 2,
      baseDelayMs: 250,
      maxDelayMs: 2000,
      shouldRetry: (err) =>
        err instanceof ApiError &&
        (err.code === "upstream_unavailable" || err.code === "upstream_network")
    });
  };

  const summarize = async (input: SummarizeInput, opts: CallOpts): Promise<SummarizeOutput> => {
    const messages = buildSummarizeTopic(input);
    const payload = {
      model: config.modelSummarize,
      messages,
      temperature: 0.2
    };

    const data = await callWithRetry(payload, opts);
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    return {
      summary: content,
      model: data.model ?? config.modelSummarize,
      usage: toUsage(data.usage?.prompt_tokens, data.usage?.completion_tokens)
    };
  };

  const generate = async (input: GenerateInput, opts: CallOpts): Promise<GenerateOutput> => {
    const messages = buildGenerateMessages(input);
    const payload = {
      model: config.modelGenerate,
      messages,
      temperature: input.temperature,
      max_tokens: input.maxTokens
    };

    const data = await callWithRetry(payload, opts);
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    return {
      text: content,
      model: data.model ?? config.modelGenerate,
      usage: toUsage(data.usage?.prompt_tokens, data.usage?.completion_tokens)
    };
  };

  const complete = async (input: CompleteInput, opts: CallOpts): Promise<GenerateOutput> => {
    const payload = {
      model: config.modelGenerate,
      messages: [{ role: "user", content: input.prompt }],
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 256
    };

    const data = await callWithRetry(payload, opts);
    const content = data.choices?.[0]?.message?.content?.trim() ?? "";

    return {
      text: content,
      model: data.model ?? config.modelGenerate,
      usage: toUsage(data.usage?.prompt_tokens, data.usage?.completion_tokens)
    };
  };

  return { summarize, generate, complete };
};
