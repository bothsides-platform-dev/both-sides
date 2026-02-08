"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import { useTheme } from "next-themes";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { CATEGORY_META, CATEGORY_SLUG_MAP, CATEGORY_TO_SLUG, CATEGORY_COLORS } from "@/lib/constants";
import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
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

const categories = Object.keys(CATEGORY_META) as Category[];

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const categorySlug = searchParams.get("category");
  const categoryEnum = categorySlug ? CATEGORY_SLUG_MAP[categorySlug] : undefined;

  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(1);
  const limit = 20;

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams();
      if (slug) params.set("category", slug);
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

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => handleCategoryChange(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !categorySlug
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          전체
        </button>
        {categories.map((cat) => {
          const slug = CATEGORY_TO_SLUG[cat];
          const meta = CATEGORY_META[cat];
          const isActive = categorySlug === slug;
          const Icon = meta.icon;
          const hexColor = isDark ? CATEGORY_COLORS[cat].dark : CATEGORY_COLORS[cat].light;

          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(slug)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !isActive && "bg-muted text-muted-foreground hover:bg-accent"
              )}
              style={isActive ? { backgroundColor: hexColor, color: "#fff" } : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Sort Tabs */}
      <div className="flex justify-end">
        <Tabs value={sort} onValueChange={handleSortChange}>
          <TabsList>
            <TabsTrigger value="latest">최신순</TabsTrigger>
            <TabsTrigger value="popular">인기순</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Topic List */}
      <div className="divide-y rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground">
            토론 목록을 불러오는데 실패했습니다.
          </div>
        ) : topics.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {categoryEnum ? "아직 이 카테고리에 토론이 없습니다." : "아직 토론이 없습니다."}
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
