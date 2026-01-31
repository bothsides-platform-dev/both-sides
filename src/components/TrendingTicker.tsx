"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TrendingUp } from "lucide-react";
import type { TrendsApiResponse } from "@/modules/trends/types";

export function TrendingTicker() {
  const { data, error, isLoading } = useSWR<TrendsApiResponse>(
    "/api/trends",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  if (isLoading || error || !data || data.data.trends.length === 0) {
    return null;
  }

  const trends = data.data.trends.slice(0, 10);

  return (
    <div className="w-full bg-muted/50 border-b overflow-hidden">
      <div className="flex items-center">
        {/* 고정된 라벨 */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-background border-r">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium whitespace-nowrap">인기</span>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-hidden relative group" aria-live="off">
          <div className="animate-scroll-left hover:pause-animation flex whitespace-nowrap py-1.5">
            {/* 첫 번째 세트 */}
            {trends.map((trend) => (
              <a
                key={`first-${trend.rank}`}
                href={`https://www.google.com/search?q=${encodeURIComponent(trend.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 text-sm hover:text-primary transition-colors"
                title={`${trend.query} 검색하기`}
              >
                <span className="text-muted-foreground font-medium">
                  {trend.rank}
                </span>
                <span className="hover:underline">{trend.query}</span>
              </a>
            ))}
            {/* 두 번째 세트 (무한 루프를 위한 복제) */}
            {trends.map((trend) => (
              <a
                key={`second-${trend.rank}`}
                href={`https://www.google.com/search?q=${encodeURIComponent(trend.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 text-sm hover:text-primary transition-colors"
                title={`${trend.query} 검색하기`}
              >
                <span className="text-muted-foreground font-medium">
                  {trend.rank}
                </span>
                <span className="hover:underline">{trend.query}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
