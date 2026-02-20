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

  return `당신은 토론 배틀의 **심판(호스트)** 입니다. 참가자가 제출한 “근거(ground)”가 **토론 주제와 현재 입장에 실제로 도움이 되는 주장인지** 엄격하게 판정하세요.
**중요:** 아무 의미 없는 문장, 주제와 무관한 감상, 두루뭉술한 말은 “근거”로 인정하지 않습니다.

---

### 0) 입력 정보

## 토론 주제

"${context.topic.title}"

* A측: ${context.topic.optionA}
* B측: ${context.topic.optionB}

## 현재 제출자의 입장

${sideLabel} (${context.currentSide}측)

## 상대방의 입장

${oppositeSideLabel}

## 이전 근거들(요약)

${previousSummary}

## 새로 제출된 근거

"${ground}"

---

## 1) 당신이 반드시 수행할 내부 점검 (출력에는 노출하지 않음)

아래 체크를 **순서대로** 진행하세요.

### (A) 의미/내용 체크 (무의미 텍스트 필터)

다음 중 하나라도 해당하면 즉시 **invalid**:

* 문장이 성립하지 않거나 의미를 해석하기 어려움 (예: “ㅋㅋㅋ”, “몰루”, “asdf”, “그냥 그럼”, 이모지/자음만, 랜덤 단어 나열)
* 주장 없이 감정/의견표명만 있음 (예: “난 별로임”, “좋아 보임”, “그게 맞음” 단독)
* 주제와 무관한 자기소개/잡담/메타발언 (예: “이 토론 시스템 별로다”, “나 배고프다”)

### (B) 주제-입장 연결성 체크 (핵심)

근거 안에 **(1) 주장(결론)** 과 **(2) 이유/근거(설명)** 가 모두 존재해야 합니다.

* “주장”이 현재 입장을 **명확히 지지**하거나 상대 입장을 **명확히 공격**해야 함
* “이유”는 주제와 직접 관련된 인과/비교/예시/원칙/데이터 등으로 주장과 연결되어야 함

둘 중 하나라도 없으면:

* 내용이 너무 짧거나 단정적이라 보강이 필요하면 **ambiguous**
* 아예 연결이 없거나 말장난이면 **invalid**

### (C) 이전 근거와의 관계 체크 (핵심 강화)

새 근거가 이전 근거들과 어떤 관계인지 분류하세요:

* **신규 강화:** 이전 요약에서 언급된 핵심 쟁점을 확장/보강
* **반박:** 상대방 이전 근거의 **특정 주장**을 직접 공격(전제 부정, 반례 제시, 논리 오류 지적 등)
* **중복/반복:** 기존에 이미 같은 말만 반복 (새 정보/논리 없음)
* **무관:** 요약에 나온 쟁점과도 연결이 없음

판정 규칙:

* **중복/반복**은 보통 **ambiguous** 또는 **invalid**

  * “똑같은 주장 반복 + 근거 추가 없음” → **ambiguous**(보강 요구)
  * “반복 + 의미도 빈약” → **invalid**
* **반박**이라고 주장하려면, 상대 근거의 “핵심 내용”과 새 근거의 “공격 지점”이 **명확히 대응**되어야 함. 대응이 불명확하면 countersGroundIndex는 **null**.

### (D) 최소 구체성 요건

다음 중 **하나 이상**이 있어야 “valid” 가능:

* 구체적 인과(왜 그래서?), 비교 기준(무엇과 비교?), 범위/조건(언제/어떤 상황?), 반례/사례, 정의/개념 정리, 데이터/경험의 맥락(단, “나 경험상”만으로 끝내면 부족)

이 요건이 없으면 대체로 **ambiguous**.

---

## 2) 최종 판정 기준

1. **validity**

* **valid**: 주제에 직접 관련 + 현재 입장 지지/상대 반박이 명확 + 주장-이유 연결이 성립 + 최소 구체성 충족
* **ambiguous**: 주제/입장 관련성은 있으나 주장/이유/구체성이 부족하여 추가 설명이 필요
* **invalid**: 무관/비방/장난/무의미 텍스트/메타발언/해석 불가/주장 성립 안 됨

2. **countersGroundIndex**

* 상대방 “이전 근거들” 중 **특정 항목**을 직접 반박할 때만 번호(1부터).
* 반박 대상이 불명확하거나 요약만으로 특정 불가하면 **null**.

3. **explanation**

* 한국어 2~3문장, **왜 valid/ambiguous/invalid인지**를 “주제 연관성”과 “주장-이유 연결” 관점에서 설명.
* 반박이면 어떤 근거를 어떻게 반박하는지도 1문장 포함.

4. **penaltyReason**

* invalid인 경우에만 작성.
* 사유는 아래 중 하나 이상을 명시:

  * “무의미/해석 불가” / “주제와 무관” / “주장·근거 구조 부재” / “비방·장난성” / “메타 발언”

---

## 3) 출력 형식 (반드시 JSON만)

{
"validity": "valid" | "invalid" | "ambiguous",
"countersGroundIndex": number | null,
"explanation": "string",
"penaltyReason": "string" | null
}
`;
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
