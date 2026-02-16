import { memoryCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { isKoreanOrEnglishOnly } from "@/lib/language";
import type {
  TrendItem,
  CachedTrends,
  NamuWikiTrendingResponse,
} from "./types";

const NAMUWIKI_URL = "https://namu.wiki";

/**
 * 나무위키에서 인기 검색어 가져오기
 * 나무위키 메인 페이지에 JSON 요청을 보내면 인기 검색어 문자열 배열을 반환
 */
async function fetchFromNamuWiki(): Promise<TrendItem[]> {
  const response = await fetch(NAMUWIKI_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3",
    },
    method: "GET",
  });

  if (!response.ok) {
    console.error(
      `나무위키 요청 실패: ${response.status} ${response.statusText}`
    );
    throw new Error("트렌드 데이터를 가져오는데 실패했습니다.");
  }

  const data: NamuWikiTrendingResponse = await response.json();

  if (!Array.isArray(data)) {
    console.error("나무위키 응답이 배열이 아닙니다.");
    throw new Error("트렌드 데이터를 가져오는데 실패했습니다.");
  }

  // 한국어 또는 영어만 포함하는 검색어로 필터링
  const filteredSearches = data.filter((query) =>
    isKoreanOrEnglishOnly(query)
  );

  // TrendItem 형식으로 변환 (상위 20개만)
  return filteredSearches.slice(0, 20).map((query, index) => ({
    rank: index + 1,
    query,
  }));
}

/**
 * 트렌딩 검색어 가져오기 (캐시 우선)
 */
export async function getTrendingSearches(): Promise<{
  trends: TrendItem[];
  updatedAt: string;
  cachedUntil: string;
}> {
  // 캐시 확인
  const cached = memoryCache.get<CachedTrends>(CACHE_KEYS.TRENDS);

  if (cached) {
    console.log("[Trends] 캐시에서 트렌드 데이터 반환");
    return {
      trends: cached.trends,
      updatedAt: cached.updatedAt,
      cachedUntil: new Date(cached.expiresAt).toISOString(),
    };
  }

  // API 호출
  console.log("[Trends] 나무위키에서 트렌드 데이터 가져오기");
  const trends = await fetchFromNamuWiki();
  const now = new Date();
  const expiresAt = now.getTime() + CACHE_TTL.TRENDS;

  // 캐시 저장
  const cacheData: CachedTrends = {
    trends,
    updatedAt: now.toISOString(),
    expiresAt,
  };
  memoryCache.set(CACHE_KEYS.TRENDS, cacheData, CACHE_TTL.TRENDS);

  return {
    trends,
    updatedAt: now.toISOString(),
    cachedUntil: new Date(expiresAt).toISOString(),
  };
}

/**
 * 캐시 강제 갱신 (관리자용)
 */
export async function refreshTrendingSearches(): Promise<{
  trends: TrendItem[];
  updatedAt: string;
  cachedUntil: string;
}> {
  // 캐시 삭제
  memoryCache.delete(CACHE_KEYS.TRENDS);

  // 새로 가져오기
  return getTrendingSearches();
}
