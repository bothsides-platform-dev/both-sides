import type { Side } from "@prisma/client";

type BattleContext = {
  topic: { title: string; optionA: string; optionB: string };
  challengerSide: Side;
  challengedSide: Side;
  previousGrounds: { role: string; content: string; userId: string | null }[];
  currentSide: Side;
};

export function buildEvaluateGroundPrompt(
  context: BattleContext,
  ground: string
): string {
  const sideLabel =
    context.currentSide === "A"
      ? context.topic.optionA
      : context.topic.optionB;
  const oppositeSideLabel =
    context.currentSide === "A"
      ? context.topic.optionB
      : context.topic.optionA;

  const previousSummary =
    context.previousGrounds.length > 0
      ? context.previousGrounds
          .map((g, i) => `[${i + 1}] (${g.role}): ${g.content}`)
          .join("\n")
      : "아직 제출된 근거가 없습니다.";

  return `당신은 토론 배틀의 심판(호스트)입니다. 토론 참가자가 제출한 근거를 평가해야 합니다.

## 토론 주제
"${context.topic.title}"
- A측: ${context.topic.optionA}
- B측: ${context.topic.optionB}

## 현재 제출자의 입장
${sideLabel} (${context.currentSide}측)

## 상대방의 입장
${oppositeSideLabel}

## 이전 근거들
${previousSummary}

## 새로 제출된 근거
"${ground}"

## 평가 기준
1. **유효성(validity)**: 근거가 해당 입장을 지지하는 논리적인 주장인지 판단합니다.
   - "valid": 논리적이고 토론 주제에 관련된 근거
   - "invalid": 관련 없는 내용, 비방, 장난성 응답, 의미 없는 텍스트
   - "ambiguous": 근거가 불명확하여 추가 설명이 필요한 경우

2. **반박(countersGroundIndex)**: 상대방의 이전 근거를 직접 반박하는 경우, 해당 근거의 인덱스 번호를 반환합니다 (1부터 시작). 반박이 아닌 경우 null.

3. **설명(explanation)**: 한국어로 간결하게 평가 결과를 설명합니다 (2-3문장).

4. **패널티 사유(penaltyReason)**: invalid인 경우에만, 왜 패널티가 부과되는지 설명합니다.

반드시 아래 JSON 형식으로 응답하세요:
{
  "validity": "valid" | "invalid" | "ambiguous",
  "countersGroundIndex": number | null,
  "explanation": "string",
  "penaltyReason": "string" | null
}`;
}

export function buildOpeningMessagePrompt(
  topic: { title: string; optionA: string; optionB: string },
  challengerName: string,
  challengedName: string
): string {
  return `당신은 토론 배틀의 호스트입니다. 드라마틱하고 재미있는 배틀 시작 멘트를 한국어로 작성해주세요.

## 토론 주제
"${topic.title}"
- A측: ${topic.optionA}
- B측: ${topic.optionB}

## 참가자
- 도전자: ${challengerName}
- 상대: ${challengedName}

## 요구사항
- 2-3문장으로 간결하게
- 토론 주제를 언급하며 흥미를 유발
- 배틀 분위기를 살리는 역동적인 표현 사용
- 이모지 적절히 활용
- JSON이 아닌 순수 텍스트로만 응답`;
}

export function buildVictoryMessagePrompt(
  topic: { title: string; optionA: string; optionB: string },
  winnerName: string,
  loserName: string,
  endReason: string
): string {
  const reasonText =
    endReason === "hp_zero"
      ? "HP 소진"
      : endReason === "resigned"
        ? "기권"
        : "시간 초과";

  return `당신은 토론 배틀의 호스트입니다. 배틀 종료 후 승리 선언 멘트를 한국어로 작성해주세요.

## 토론 주제
"${topic.title}"

## 결과
- 승자: ${winnerName}
- 패자: ${loserName}
- 종료 사유: ${reasonText}

## 요구사항
- 2-3문장으로 간결하게
- 승자를 축하하면서도 좋은 토론이었다는 점 강조
- 스포츠맨십 있는 톤
- 이모지 적절히 활용
- JSON이 아닌 순수 텍스트로만 응답`;
}
