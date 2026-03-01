import type { Side } from "@prisma/client";
import type { GroundsRegistry, Ground } from "./types";

type BattleContext = {
  topic: { title: string; optionA: string; optionB: string };
  challengerSide: Side;
  challengedSide: Side;
  groundsRegistry: GroundsRegistry;
  currentSide: Side;
};

function formatGroundsTable(grounds: Ground[], sideLabel: string): string {
  if (grounds.length === 0) return `(${sideLabel}: 아직 근거 없음)`;

  return grounds
    .map((g) => {
      const statusMark = g.status === "countered" ? "~~반박됨~~" : "활성";
      const reinforced = g.reinforcedCount > 0 ? ` [보강 ${g.reinforcedCount}회]` : "";
      const counteredInfo = g.counteredBy ? ` (${g.counteredBy}에 의해 반박)` : "";
      return `| ${g.id} | ${g.summary} | ${statusMark}${reinforced}${counteredInfo} |`;
    })
    .join("\n");
}

export function buildEvaluateGroundPrompt(
  context: BattleContext,
  ground: string
): string {
  const sideLabel =
    context.currentSide === "A"
      ? context.topic.optionA
      : context.topic.optionB;
  const oppositeSide: Side = context.currentSide === "A" ? "B" : "A";
  const oppositeSideLabel =
    context.currentSide === "A"
      ? context.topic.optionB
      : context.topic.optionA;

  const myGrounds = context.groundsRegistry[context.currentSide];
  const opponentGrounds = context.groundsRegistry[oppositeSide];

  const myGroundsTable = formatGroundsTable(myGrounds, sideLabel);
  const opponentGroundsTable = formatGroundsTable(opponentGrounds, oppositeSideLabel);

  return `당신은 토론 배틀의 **심판(호스트)** 입니다.
당신의 임무는 **오직 하나**, 아래에 제시된 **"새로 제출된 근거"** 를 5가지 분류 중 하나로 판정하는 것입니다.

⚠️ **절대 규칙**:
* 반드시 **한국어**로만 응답하세요.
* 이전 근거 전체를 재평가하지 마세요.
* 토론 전체의 승패를 판단하지 마세요.
* 오직 "새로 제출된 근거"만 판정하세요.

---

## 토론 정보

### 주제: "${context.topic.title}"
* A측: ${context.topic.optionA}
* B측: ${context.topic.optionB}

### 현재 제출자: ${sideLabel} (${context.currentSide}측)
### 상대방: ${oppositeSideLabel} (${oppositeSide}측)

---

## 근거 레지스트리

### ${sideLabel} (${context.currentSide}측) 근거:
| ID | 요약 | 상태 |
|----|------|------|
${myGroundsTable}

### ${oppositeSideLabel} (${oppositeSide}측) 근거:
| ID | 요약 | 상태 |
|----|------|------|
${opponentGroundsTable}

---

## 평가 대상 (새로 제출된 근거)

"${ground}"

---

## 5단계 판정 절차 (순서대로 실행)

### 1단계: 유효성 검사 → \`invalid\`
다음 중 하나라도 해당하면 즉시 \`invalid\`:
* 의미 해석 불가 / 장난 / 비방 / 무의미 텍스트
* 감정 표현만 있고 주장 구조 없음
* 주제와 완전히 무관한 잡담이나 메타 발언
* 현재 입장(${sideLabel})과 관련 없는 내용

### 2단계: 중복 검사 → \`redundant\`
제출자 측의 기존 **활성 근거**와 비교:
* 같은 내용을 다른 말로 반복한 경우
* 기존 근거에서 이미 암시/포함된 논점인 경우
* 핵심 논리가 동일하고 새로운 정보가 없는 경우
→ \`redundant\` 판정 시 \`penaltyReason\`에 어떤 근거와 중복인지 명시

### 3단계: 반박 검사 → \`counter\`
상대측의 **활성(active) 근거** 중 하나를 직접 반박하는가:
* 상대 근거의 전제/논리/증거를 명확히 부정하는 경우
* 단순히 반대 느낌이 아니라 **구체적으로 어떤 근거를 왜 틀렸는지** 설명하는 경우
→ \`counter\` 판정 시 \`targetGroundId\`에 반박 대상 ID (예: "G-B2") 기재
→ \`groundSummary\`에 이 반박 근거의 한 줄 요약 기재

### 4단계: 보강 검사 → \`reinforce\`
제출자 측의 기존 **활성 근거** 중 하나를 보강하는가:
* 같은 논점에 새로운 증거/사례/관점을 추가하는 경우
* 기존 근거의 약점을 보완하는 경우
→ \`reinforce\` 판정 시 \`reinforcedGroundId\`에 보강 대상 ID 기재
→ \`updatedSummary\`에 보강된 내용을 반영한 업데이트된 요약 기재

### 5단계: 새 근거 → \`new_ground\`
위 어디에도 해당하지 않으면:
* 기존과 다른 새로운 논점/관점을 제시하는 경우
→ \`groundSummary\`에 한 줄 요약 기재

---

## 출력 형식 (JSON만 출력, 다른 텍스트 금지)

{
  "action": "new_ground" | "reinforce" | "counter" | "redundant" | "invalid",
  "explanation": "2~3문장으로 판정 이유를 한국어로 설명",
  "targetGroundId": "G-Xn" | null,
  "reinforcedGroundId": "G-Xn" | null,
  "groundSummary": "한 줄 요약" | null,
  "updatedSummary": "보강 반영 요약" | null,
  "penaltyReason": "패널티 사유" | null
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
- JSON이 아닌 순수 텍스트로만 응답
- 반드시 한국어로 응답`;
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
- JSON이 아닌 순수 텍스트로만 응답
- 반드시 한국어로 응답`;
}
