import type { Side } from "@prisma/client";
import type { GroundEvaluation } from "./types";
import {
  buildEvaluateGroundPrompt,
  buildOpeningMessagePrompt,
  buildVictoryMessagePrompt,
} from "./prompts";

type BattleContext = {
  topic: { title: string; optionA: string; optionB: string };
  challengerSide: Side;
  challengedSide: Side;
  previousGrounds: { role: string; content: string; userId: string | null }[];
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
        validity: "valid",
        countersGroundIndex: null,
        explanation: "⚙️ 평가 시스템을 사용할 수 없어 근거가 자동 수락되었습니다.",
        penaltyReason: null,
      }),
    };
  }

  const baseUrl = settings.baseUrl || "https://api.openai.com/v1";
  const model = settings.modelGrounds || "gpt-4o";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const res = await fetch(`${normalizedBase}chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 500,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`LLM API error: ${res.status}`);
  }

  const data = await res.json();
  return { text: data.choices?.[0]?.message?.content?.trim() ?? "" };
}

export async function evaluateGround(
  context: BattleContext,
  ground: string
): Promise<GroundEvaluation> {
  const prompt = buildEvaluateGroundPrompt(context, ground);
  const result = await callLlm(prompt);

  try {
    const parsed = JSON.parse(extractJson(result.text));
    return {
      validity: parsed.validity || "valid",
      countersGroundIndex: parsed.countersGroundIndex ?? null,
      explanation: parsed.explanation || "근거가 평가되었습니다.",
      penaltyReason: parsed.penaltyReason ?? null,
    };
  } catch {
    return {
      validity: "valid",
      countersGroundIndex: null,
      explanation: "근거가 수락되었습니다.",
      penaltyReason: null,
    };
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
