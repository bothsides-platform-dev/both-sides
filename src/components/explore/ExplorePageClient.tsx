"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import useSWR from "swr";
import { CATEGORY_SLUG_MAP, CATEGORY_TO_SLUG } from "@/lib/constants";
import { CategoryChips } from "@/components/ui/CategoryChips";
import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";
import { PostListItem, type PostListItemProps } from "@/components/posts/PostListItem";
import { FeedListItem, type FeedItem } from "@/components/feed/FeedListItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicBubbleMap } from "@/components/explore/TopicBubbleMap";
import type { Category } from "@prisma/client";

type ContentType = "all" | "debate" | "post";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  const categoryEnum = categorySlug ? CATEGORY_SLUG_MAP[categorySlug] : undefined;

  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(1);
  const [contentType, setContentType] = useState<ContentType>("all");
  const [isMapCollapsed, setIsMapCollapsed] = useState(!!categoryEnum);
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

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ContentType);
    setPage(1);
  };

  // Build API URL based on content type
  const apiParams = new URLSearchParams({
    sort,
    page: String(page),
    limit: String(limit),
  });
  if (categoryEnum) apiParams.set("category", categoryEnum);

  let apiUrl: string;
  if (contentType === "all") {
    apiParams.set("type", "all");
    apiUrl = `/api/feed?${apiParams.toString()}`;
  } else if (contentType === "debate") {
    apiUrl = `/api/topics?${apiParams.toString()}`;
  } else {
    apiUrl = `/api/posts?${apiParams.toString()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, isLoading } = useSWR<{ data: any }>(apiUrl, fetcher);

  // Normalize data
  let items: FeedItem[] = [];
  let pagination: PaginationInfo | undefined;

  if (data?.data) {
    if (contentType === "all") {
      items = (data.data.items ?? []) as FeedItem[];
      pagination = data.data.pagination;
    } else if (contentType === "debate") {
      items = ((data.data.topics ?? []) as TopicListItemProps["topic"][]).map((t) => ({
        type: "topic" as const,
        data: t,
      }));
      pagination = data.data.pagination;
    } else {
      items = ((data.data.posts ?? []) as PostListItemProps["post"][]).map((p) => ({
        type: "post" as const,
        data: p,
      }));
      pagination = data.data.pagination;
    }
  }

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <div className="space-y-4">
      {/* Bubble Map */}
      {isMapCollapsed ? (
        <button
          type="button"
          onClick={() => setIsMapCollapsed(false)}
          className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
        >
          <span className="text-base font-semibold">토픽 버블맵</span>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>
      ) : (
        <TopicBubbleMap highlightCategory={categoryEnum ?? null} onCollapse={() => setIsMapCollapsed(true)} />
      )}

      {/* Content Type Tabs */}
      <div className="flex items-center gap-4">
        <Tabs value={contentType} onValueChange={handleContentTypeChange} className="shrink-0">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="debate">토론</TabsTrigger>
            <TabsTrigger value="post">자유글</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Category + Sort */}
      <div className="flex items-center gap-4">
        <CategoryChips
          value={categoryEnum}
          onChange={handleCategoryChange}
          className="min-w-0 flex-1"
        />

        <Tabs value={sort} onValueChange={handleSortChange} className="ml-auto shrink-0">
          <TabsList>
            <TabsTrigger value="latest">최신순</TabsTrigger>
            <TabsTrigger value="popular">인기순</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
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
            목록을 불러오는데 실패했습니다.
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Search className="h-8 w-8" />
            <p>{categoryEnum ? "아직 이 카테고리에 게시글이 없습니다." : "아직 게시글이 없습니다."}</p>
            <p className="text-sm">{categoryEnum ? "다른 카테고리를 확인해보세요." : "첫 번째 게시글을 작성해보세요!"}</p>
          </div>
        ) : (
          items.map((item) => (
            <FeedListItem key={`${item.type}-${item.data.id}`} item={item} />
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
