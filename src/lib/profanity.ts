import Filter from "badwords-ko";

const filter = new Filter();

/**
 * 텍스트에 비속어가 포함되어 있는지 검사
 */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}
