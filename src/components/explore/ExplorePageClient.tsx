"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import useSWR from "swr";
import { CATEGORY_SLUG_MAP, CATEGORY_TO_SLUG } from "@/lib/constants";
import { CategoryChips } from "@/components/ui/CategoryChips";
import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicBubbleMap } from "@/components/explore/TopicBubbleMap";
import type { Category } from "@prisma/client";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TopicsResponse {
  data: {
    topics: TopicListItemProps["topic"][];
    pagination: PaginationInfo;
  };
}

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const categoryEnum = categorySlug ? CATEGORY_SLUG_MAP[categorySlug] : undefined;

  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(1);
  const limit = 20;

  const handleCategoryChange = useCallback(
    (cat: Category | undefined) => {
      const params = new URLSearchParams();
      if (cat) params.set("category", CATEGORY_TO_SLUG[cat]);
      router.push(`/explore${params.toString() ? `?${params}` : ""}`, { scroll: false });
      setPage(1);
      setSort("latest");
    },
    [router]
  );

  const handleSortChange = (value: string) => {
    setSort(value as "latest" | "popular");
    setPage(1);
  };

  const apiParams = new URLSearchParams({
    sort,
    page: String(page),
    limit: String(limit),
  });
  if (categoryEnum) apiParams.set("category", categoryEnum);

  const { data, error, isLoading } = useSWR<TopicsResponse>(
    `/api/topics?${apiParams.toString()}`,
    fetcher
  );

  const topics = data?.data?.topics ?? [];
  const pagination = data?.data?.pagination;
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <div className="space-y-4">
      {/* Bubble Map */}
      <TopicBubbleMap highlightCategory={categoryEnum ?? null} />

      {/* Category + Sort */}
      <div className="flex items-center gap-4">
        <CategoryChips
          value={categoryEnum}
          onChange={handleCategoryChange}
          className="min-w-0 flex-1"
        />

        {/* 정렬 탭 - 오른쪽 정렬 */}
        <Tabs value={sort} onValueChange={handleSortChange} className="ml-auto shrink-0">
          <TabsList>
            <TabsTrigger value="latest">최신순</TabsTrigger>
            <TabsTrigger value="popular">인기순</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Topic List */}
      <div className="divide-y rounded-lg border bg-card">
        {isLoading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="hidden md:block h-[60px] w-[80px] shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground">
            토론 목록을 불러오는데 실패했습니다.
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Search className="h-8 w-8" />
            <p>{categoryEnum ? "아직 이 카테고리에 토론이 없습니다." : "아직 토론이 없습니다."}</p>
            <p className="text-sm">{categoryEnum ? "다른 카테고리를 확인해보세요." : "첫 번째 토론을 시작해보세요!"}</p>
          </div>
        ) : (
          topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            더 보기
          </Button>
        </div>
      )}
    </div>
  );
}

export function ExplorePageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  );
}
