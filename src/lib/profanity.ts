// 한국어 비속어 목록 (닉네임 필터링용 핵심 단어)
const KOREAN_BAD_WORDS = [
  "씨발", "씨bal", "씨1발", "시발", "시1발", "ㅅㅂ", "ㅆㅂ",
  "병신", "ㅂㅅ", "빙신", "병1신",
  "지랄", "ㅈㄹ", "지1랄",
  "새끼", "ㅅㄲ", "새1끼", "썌끼",
  "개새", "개색", "개섹",
  "니미", "니엄", "느금",
  "좆", "좃", "졷", "ㅈㅇ",
  "보지", "ㅂㅈ", "봊",
  "자지", "ㅈㅈ",
  "씹", "ㅆㅇ",
  "꺼져", "닥쳐", "뒤져",
  "썅", "ㅆㅇ",
  "미친", "ㅁㅊ", "미1친",
  "년", "놈",
  "fuck", "shit", "damn", "ass", "bitch", "dick", "pussy",
  "bastard", "cunt", "whore", "slut",
];

/**
 * 텍스트에 비속어가 포함되어 있는지 검사
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return KOREAN_BAD_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
}
