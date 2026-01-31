/**
 * 간단한 메모리 캐시 유틸리티 (TTL 지원)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * 캐시에서 데이터 조회
   * @param key 캐시 키
   * @returns 캐시된 데이터 또는 null (만료/없음)
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // 만료 체크
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 캐시에 데이터 저장
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param ttlMs TTL (밀리초)
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * 캐시 항목의 만료 시간 조회
   * @param key 캐시 키
   * @returns 만료 시간 (Unix timestamp) 또는 null
   */
  getExpiresAt(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.expiresAt;
  }

  /**
   * 캐시 항목 삭제
   * @param key 캐시 키
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 전체 캐시 클리어
   */
  clear(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const memoryCache = new MemoryCache();

// 캐시 키 상수
export const CACHE_KEYS = {
  TRENDS: "trends:kr",
} as const;

// 기본 TTL 상수 (밀리초)
export const CACHE_TTL = {
  TRENDS: 3 * 60 * 60 * 1000, // 3시간 (하루 8회, 월 ~240회)
} as const;
