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

  return `당신은 토론 배틀의 **심판(호스트)** 입니다.
당신의 임무는 **오직 하나**, 아래에 제시된 **“새로 제출된 근거” 한 문장(또는 한 단락)** 만을 평가하는 것입니다.

⚠️ 매우 중요:

* 이전 근거 전체를 재평가하지 마세요.
* 토론 전체의 승패를 판단하지 마세요.
* 양측의 논리 수준을 비교하지 마세요.
* 오직 **"새로 제출된 근거"가 유효한 근거인지**만 판정하세요.

---

## 0) 입력 정보

### 토론 주제

"${context.topic.title}"

* A측: ${context.topic.optionA}
* B측: ${context.topic.optionB}

### 현재 제출자의 입장

${sideLabel} (${context.currentSide}측)

### 상대방의 입장

${oppositeSideLabel}

### 이전 근거들 (참고용 요약)

${previousSummary}

※ 이전 근거들은 오직 "반박 여부 판단"을 위해서만 참고합니다.
※ 이전 근거들의 타당성을 다시 평가하지 마세요.

---

## 🔎 평가 대상 (이것만 판단하세요)

"${ground}"

당신이 판단해야 할 유일한 대상은 위 텍스트입니다.

---

## 1) 내부 점검 절차 (출력에 노출하지 않음)

### (A) 의미/형식 체크 — 대상은 오직 새 근거

다음 중 하나라도 해당하면 즉시 **invalid**:

* 의미 해석이 불가능
* 장난/비방/무의미 텍스트
* 감정 표현만 있고 주장 구조 없음
* 주제와 무관한 잡담/메타 발언

### (B) 주제-입장 연결성 체크

"새로 제출된 근거" 안에 반드시 다음이 존재해야 함:

1. 현재 입장을 지지하거나 상대 입장을 공격하는 **명확한 주장**
2. 그 주장을 뒷받침하는 **이유/설명**

둘 중 하나라도 없으면:

* 관련성은 있으나 부족 → ambiguous
* 거의 연결 없음 → invalid

### (C) 이전 근거와의 관계 체크 (새 근거만 기준)

* 새 근거가 상대의 특정 이전 근거를 직접 반박하는 경우에만 countersGroundIndex 설정
* 단순히 분위기상 반대 느낌이면 반박으로 인정하지 않음
* 반박 대상이 명확히 특정되지 않으면 null

### (D) 최소 구체성 요건

다음 중 하나 이상 포함되어야 valid 가능:

* 인과 설명
* 비교
* 조건/범위
* 사례/예시
* 개념 정의
* 논리적 연결어를 통한 추론 구조

---

## 2) 최종 판정 기준

### validity

* **valid**: 새 근거 하나만 보았을 때, 논리적으로 성립하고 입장을 명확히 지지/반박함
* **ambiguous**: 방향성은 있으나 논리 구조 또는 구체성이 부족
* **invalid**: 무관/무의미/비방/주장 구조 부재

### countersGroundIndex

* 오직 새 근거가 상대의 특정 이전 근거를 명확히 반박하는 경우만 번호
* 그렇지 않으면 null

### explanation

* 반드시 "새로 제출된 근거"를 기준으로 설명
* 2~3문장, 간결

### penaltyReason

* invalid일 경우에만 작성
* 사유를 명확히 기술

---

## 3) 출력 형식 (JSON만 출력)

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
