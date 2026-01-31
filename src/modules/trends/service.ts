import { memoryCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import type {
  TrendItem,
  CachedTrends,
  SerpApiTrendingResponse,
} from "./types";

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";

/**
 * SerpAPI에서 한국 트렌딩 검색어 가져오기
 */
async function fetchFromSerpApi(): Promise<TrendItem[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.error("SERPAPI_KEY 환경변수가 설정되지 않았습니다.");
    throw new Error("트렌드 서비스를 사용할 수 없습니다.");
  }

  const params = new URLSearchParams({
    engine: "google_trends_trending_now",
    geo: "KR",
    hl: "ko",
    api_key: apiKey,
  });

  const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    console.error(
      `SerpAPI 요청 실패: ${response.status} ${response.statusText}`
    );
    throw new Error("트렌드 데이터를 가져오는데 실패했습니다.");
  }

  const data: SerpApiTrendingResponse = await response.json();

  if (data.error) {
    console.error(`SerpAPI 에러: ${data.error}`);
    throw new Error("트렌드 데이터를 가져오는데 실패했습니다.");
  }

  const trendingSearches = data.trending_searches || [];

  // TrendItem 형식으로 변환 (상위 20개만)
  return trendingSearches.slice(0, 20).map((item, index) => ({
    rank: index + 1,
    query: item.query,
    traffic: item.formattedTraffic,
    articles: item.articles?.slice(0, 3).map((article) => ({
      title: article.title,
      link: article.link,
      source: article.source,
    })),
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
  console.log("[Trends] SerpAPI에서 트렌드 데이터 가져오기");
  const trends = await fetchFromSerpApi();
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
