import KoreanFilter from "badwords-ko";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Filter: EnglishFilter } = require("bad-words") as {
  Filter: new () => { isProfane: (text: string) => boolean };
};

let koreanFilter: KoreanFilter | null = null;
let englishFilter: { isProfane: (text: string) => boolean } | null = null;

function getKoreanFilter(): KoreanFilter {
  if (!koreanFilter) koreanFilter = new KoreanFilter();
  return koreanFilter;
}

function getEnglishFilter(): { isProfane: (text: string) => boolean } {
  if (!englishFilter) englishFilter = new EnglishFilter();
  return englishFilter;
}

export function containsProfanity(text: string): boolean {
  return getKoreanFilter().isProfane(text) || getEnglishFilter().isProfane(text);
}
