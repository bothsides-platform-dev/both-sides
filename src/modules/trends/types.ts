/**
 * 나무위키 인기 검색어 응답 타입
 */

// 나무위키 API 응답: 인기 검색어 문자열 배열
export type NamuWikiTrendingResponse = string[];

// 클라이언트로 전달할 트렌드 아이템
export interface TrendItem {
  rank: number;
  query: string;
}

// API 응답 타입
export interface TrendsApiResponse {
  data: {
    trends: TrendItem[];
    updatedAt: string;
    cachedUntil: string;
  };
}

// 캐시된 트렌드 데이터
export interface CachedTrends {
  trends: TrendItem[];
  updatedAt: string;
  expiresAt: number;
}
