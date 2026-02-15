"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Loader2, TrendingUp, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { CATEGORY_META } from "@/lib/constants";
import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";
import { Button } from "@/components/ui/button";

interface RelatedTopicsProps {
  topicId: string;
  category: Category;
}

interface TopicsResponse {
  data: {
    topics: TopicListItemProps["topic"][];
    pagination: {
      page: number;
      total: number;
      totalPages: number;
    };
  };
}

type FilterMode = "category" | "popular" | "latest";

const LIMIT = 6;

const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
};

export function RelatedTopics({ topicId, category }: RelatedTopicsProps) {
  const [filter, setFilter] = useState<FilterMode>("popular");
  const [page, setPage] = useState(1);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      exclude: topicId,
    });
    if (filter === "category") {
      params.set("category", category);
      params.set("sort", "popular");
    } else if (filter === "popular") {
      params.set("sort", "popular");
    } else {
      params.set("sort", "latest");
    }
    return `/api/topics?${params.toString()}`;
  }, [filter, page, category, topicId]);

  const { data, isLoading } = useSWR<TopicsResponse>(apiUrl, fetcher, swrOptions);

  const topics = data?.data?.topics ?? [];
  const totalPages = data?.data?.pagination?.totalPages ?? 1;

  const handleFilterChange = (newFilter: FilterMode) => {
    if (newFilter === filter) return;
    setFilter(newFilter);
    setPage(1);
  };

  const CategoryIcon = CATEGORY_META[category].icon;
  const filters: { key: FilterMode; label: string; icon: typeof TrendingUp }[] = [
    { key: "popular", label: "인기", icon: TrendingUp },
    { key: "category", label: CATEGORY_META[category].label, icon: CategoryIcon },
    { key: "latest", label: "최신", icon: Clock },
  ];

  return (
    <section className="border-t border-border pt-5 md:pt-8 space-y-4">
      <h3 className="font-semibold text-base">다른 토론 둘러보기</h3>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : topics.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          표시할 토론이 없습니다
        </div>
      ) : (
        <>
          <div className="divide-y rounded-lg border bg-card">
            {topics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
