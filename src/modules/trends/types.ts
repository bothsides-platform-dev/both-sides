/**
 * SerpAPI Google Trends Trending Now 응답 타입
 */

// SerpAPI 원본 응답의 트렌드 아이템
export interface SerpApiTrendingSearch {
  query: string;
  // SerpAPI 응답에 포함될 수 있는 추가 필드들
  date?: string;
  formattedTraffic?: string;
  image?: {
    newsUrl?: string;
    source?: string;
    imageUrl?: string;
  };
  articles?: Array<{
    title: string;
    link: string;
    snippet?: string;
    source?: string;
    date?: string;
  }>;
}

// SerpAPI Google Trends Trending Now 응답 구조
export interface SerpApiTrendingResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    request_time_taken: number;
    total_time_taken: number;
    google_trends_trending_now_url: string;
  };
  trending_searches?: SerpApiTrendingSearch[];
  error?: string;
}

// 클라이언트로 전달할 트렌드 아이템
export interface TrendItem {
  rank: number;
  query: string;
  traffic?: string;
  articles?: Array<{
    title: string;
    link: string;
    source?: string;
  }>;
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
