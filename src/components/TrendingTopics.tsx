"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";
import { formatRelativeTime } from "@/lib/utils";
import { Loader2, TrendingUp, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { TrendsApiResponse, TrendItem } from "@/modules/trends/types";

function TrendItemRow({ trend }: { trend: TrendItem }) {
  const [showArticles, setShowArticles] = useState(false);
  const hasArticles = trend.articles && trend.articles.length > 0;

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trend.query)}`;

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center gap-3 py-2.5 px-1">
        <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
          {trend.rank}
        </span>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm font-medium hover:text-primary hover:underline truncate"
          title={trend.query}
        >
          {trend.query}
        </a>
        {trend.traffic && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {trend.traffic}
          </span>
        )}
        {hasArticles && (
          <button
            onClick={() => setShowArticles(!showArticles)}
            className="p-1 text-muted-foreground hover:text-foreground"
            aria-label={showArticles ? "기사 숨기기" : "기사 보기"}
          >
            {showArticles ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {showArticles && hasArticles && (
        <div className="pl-9 pr-2 pb-2 space-y-1.5">
          {trend.articles!.map((article, idx) => (
            <a
              key={idx}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground group"
            >
              <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="group-hover:underline line-clamp-2">
                {article.title}
                {article.source && (
                  <span className="text-muted-foreground/70"> - {article.source}</span>
                )}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface TrendingTopicsProps {
  className?: string;
  limit?: number;
}

export function TrendingTopics({ className, limit = 10 }: TrendingTopicsProps) {
  const { data, error, isLoading } = useSWR<TrendsApiResponse>(
    "/api/trends",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1분간 중복 요청 방지
    }
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            실시간 인기 검색어
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const trends = data.data.trends.slice(0, limit);
  const updatedAt = data.data.updatedAt;

  if (trends.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-green-500" />
          실시간 인기 검색어
        </CardTitle>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(updatedAt)} 업데이트
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y">
          {trends.map((trend) => (
            <TrendItemRow key={trend.rank} trend={trend} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// 모바일용 접이식 버전
export function TrendingTopicsCollapsible({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
  const updatedAt = data.data.updatedAt;

  return (
    <Card className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className="font-semibold">실시간 인기 검색어</span>
          {updatedAt && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(updatedAt)}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <CardContent className="pt-0 pb-3">
          <div className="divide-y">
            {trends.map((trend) => (
              <TrendItemRow key={trend.rank} trend={trend} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
