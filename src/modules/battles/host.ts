import type { Side } from "@prisma/client";
import type { GroundEvaluation, GroundsRegistry } from "./types";
import { findGround } from "./grounds";
import {
  buildEvaluateGroundPrompt,
  buildOpeningMessagePrompt,
  buildVictoryMessagePrompt,
} from "./prompts";

type BattleContext = {
  topic: { title: string; optionA: string; optionB: string };
  challengerSide: Side;
  challengedSide: Side;
  groundsRegistry: GroundsRegistry;
  currentSide: Side;
};

type BattleWithTopic = {
  topic: { title: string; optionA: string; optionB: string };
  challenger: { nickname: string | null; name: string | null };
  challenged: { nickname: string | null; name: string | null };
};

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  if (!trimmed.startsWith("{")) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return trimmed.slice(start, end + 1);
    }
  }
  return trimmed;
}

async function callLlm(prompt: string): Promise<{ text: string }> {
  const { getLlmSettings } = await import("@/modules/llm-settings/service");
  const settings = await getLlmSettings().catch(() => null);

  if (!settings?.apiKey) {
    return {
      text: JSON.stringify({
        action: "new_ground",
        explanation: "평가 시스템을 사용할 수 없어 근거가 자동 수락되었습니다.",
        targetGroundId: null,
        reinforcedGroundId: null,
        groundSummary: "자동 수락된 근거",
        updatedSummary: null,
        penaltyReason: null,
      }),
    };
  }

  const baseUrl = settings.baseUrl || "https://api.openai.com/v1";
  const model = settings.modelGrounds || "gpt-5";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const makeRequest = async (includeTemperature: boolean) => {
    const payload: Record<string, unknown> = {
      model,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 800,
    };
    if (includeTemperature) {
      payload.temperature = 0.2;
    }

    return fetch(`${normalizedBase}chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
  };

  let res = await makeRequest(true);

  if (!res.ok && res.status === 400) {
    const body = await res.text().catch(() => "");
    let errorData: { error?: { param?: string; message?: string } } = {};
    try {
      errorData = JSON.parse(body);
    } catch {
      // Not JSON, proceed to regular error handling
    }

    const isTemperatureError =
      errorData.error?.param === "temperature" ||
      errorData.error?.message?.includes("temperature") ||
      errorData.error?.message?.includes("default");

    if (isTemperatureError) {
      console.warn("[Battle LLM] Temperature not supported, retrying without it");
      res = await makeRequest(false);
    }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[Battle LLM] API error ${res.status}: ${body}`);
    throw new Error(`LLM API error: ${res.status}`);
  }

  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content?.trim() ?? "" };
}

const VALID_ACTIONS = new Set(["new_ground", "reinforce", "counter", "redundant", "invalid"]);

function makeFallbackEval(groundContent: string): GroundEvaluation {
  return {
    action: "new_ground",
    explanation: "평가 시스템에 일시적인 문제가 발생하여 근거가 자동 수락되었습니다.",
    targetGroundId: null,
    reinforcedGroundId: null,
    groundSummary: groundContent.slice(0, 50),
    updatedSummary: null,
    penaltyReason: null,
  };
}

export async function evaluateGround(
  context: BattleContext,
  ground: string
): Promise<GroundEvaluation> {
  const prompt = buildEvaluateGroundPrompt(context, ground);
  const result = await callLlm(prompt);

  try {
    const parsed = JSON.parse(extractJson(result.text));
    const action = VALID_ACTIONS.has(parsed.action) ? parsed.action : "new_ground";

    const evaluation: GroundEvaluation = {
      action,
      explanation: parsed.explanation || "근거가 평가되었습니다.",
      targetGroundId: parsed.targetGroundId ?? null,
      reinforcedGroundId: parsed.reinforcedGroundId ?? null,
      groundSummary: parsed.groundSummary ?? null,
      updatedSummary: parsed.updatedSummary ?? null,
      penaltyReason: parsed.penaltyReason ?? null,
    };

    // Validate referenced IDs exist in registry
    if (action === "counter" && evaluation.targetGroundId) {
      const target = findGround(context.groundsRegistry, evaluation.targetGroundId);
      if (!target || target.status !== "active") {
        // Target doesn't exist or already countered — fallback to new_ground
        return {
          ...evaluation,
          action: "new_ground",
          targetGroundId: null,
          groundSummary: evaluation.groundSummary || ground.slice(0, 50),
        };
      }
    }

    if (action === "reinforce" && evaluation.reinforcedGroundId) {
      const target = findGround(context.groundsRegistry, evaluation.reinforcedGroundId);
      if (!target || target.status !== "active") {
        // Target doesn't exist — fallback to new_ground
        return {
          ...evaluation,
          action: "new_ground",
          reinforcedGroundId: null,
          groundSummary: evaluation.groundSummary || ground.slice(0, 50),
        };
      }
    }

    // Ensure groundSummary is set for new_ground
    if (action === "new_ground" && !evaluation.groundSummary) {
      evaluation.groundSummary = ground.slice(0, 50);
    }

    return evaluation;
  } catch {
    return makeFallbackEval(ground);
  }
}

export async function generateOpeningMessage(
  battle: BattleWithTopic
): Promise<string> {
  const challengerName =
    battle.challenger.nickname || battle.challenger.name || "도전자";
  const challengedName =
    battle.challenged.nickname || battle.challenged.name || "상대";

  const prompt = buildOpeningMessagePrompt(
    battle.topic,
    challengerName,
    challengedName
  );

  try {
    const result = await callLlm(prompt);
    return result.text || "⚔️ 맞짱이 시작됩니다! 양측 모두 근거를 제시해주세요.";
  } catch {
    return "⚔️ 맞짱이 시작됩니다! 양측 모두 근거를 제시해주세요.";
  }
}

export async function generateVictoryMessage(
  battle: BattleWithTopic & { endReason: string | null; challengerId: string },
  winnerId: string
): Promise<string> {
  const isChallenger = winnerId === battle.challengerId;
  const winner = isChallenger ? battle.challenger : battle.challenged;
  const loser = isChallenger ? battle.challenged : battle.challenger;

  const winnerName = winner.nickname || winner.name || "승자";
  const loserName = loser.nickname || loser.name || "패자";

  const prompt = buildVictoryMessagePrompt(
    battle.topic,
    winnerName,
    loserName,
    battle.endReason || "hp_zero"
  );

  try {
    const result = await callLlm(prompt);
    return result.text || "🏆 맞짱이 종료되었습니다!";
  } catch {
    return "🏆 맞짱이 종료되었습니다!";
  }
}
