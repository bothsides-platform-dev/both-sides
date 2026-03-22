"use client";

import { useState } from "react";
import useSWR from "swr";
import { TopicListItem, type TopicListItemProps } from "./TopicListItem";
import { PostListItem, type PostListItemProps } from "@/components/posts/PostListItem";
import { FeedListItem, type FeedItem } from "@/components/feed/FeedListItem";
import { CommunityTrendingList } from "@/components/community/CommunityTrendingList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryChips } from "@/components/ui/CategoryChips";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { MessageSquare } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@prisma/client";

type ContentType = "all" | "debate" | "post" | "trending";

const ITEMS_PER_PAGE = 10;

export function CommunitySection() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const params = new URLSearchParams();
  if (selectedCategory) params.set("category", selectedCategory);
  params.set("sort", sort);
  params.set("limit", String(ITEMS_PER_PAGE));
  params.set("page", String(currentPage));

  // Build API URL based on content type
  let apiUrl: string | null = null;
  if (contentType === "all") {
    params.set("type", "all");
    apiUrl = `/api/feed?${params.toString()}`;
  } else if (contentType === "debate") {
    apiUrl = `/api/topics?${params.toString()}`;
  } else if (contentType === "post") {
    apiUrl = `/api/posts?${params.toString()}`;
  }
  // contentType === "trending" doesn't need apiUrl (handled separately)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, isLoading } = useSWR<{ data: any }>(
    contentType === "trending" ? null : apiUrl,
    fetcher
  );

  // Normalize data based on content type
  let items: FeedItem[] = [];
  let totalCount = 0;
  if (data?.data && contentType !== "trending") {
    if (contentType === "all") {
      items = (data.data.items ?? []) as FeedItem[];
      totalCount = data.data.pagination?.total ?? 0;
    } else if (contentType === "debate") {
      items = ((data.data.topics ?? []) as TopicListItemProps["topic"][]).map((t) => ({
        type: "topic" as const,
        data: t,
      }));
      totalCount = data.data.pagination?.total ?? 0;
    } else {
      items = ((data.data.posts ?? []) as PostListItemProps["post"][]).map((p) => ({
        type: "post" as const,
        data: p,
      }));
      totalCount = data.data.pagination?.total ?? 0;
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: Category | undefined) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: "latest" | "popular") => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleContentTypeChange = (newType: ContentType) => {
    setContentType(newType);
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= Math.min(maxVisible, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      } else if (currentPage >= totalPages - 2) {
        pages.push("ellipsis");
        for (let i = totalPages - (maxVisible - 1); i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <section className="space-y-4">
      {/* Content Type Tabs */}
      <div className="flex items-center gap-4">
        <Tabs value={contentType} onValueChange={(v) => handleContentTypeChange(v as ContentType)} className="shrink-0">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="debate">토론</TabsTrigger>
            <TabsTrigger value="post">자유글</TabsTrigger>
            <TabsTrigger value="trending">인기글</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Render trending content separately */}
      {contentType === "trending" ? (
        <CommunityTrendingList />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <CategoryChips
              value={selectedCategory}
              onChange={handleCategoryChange}
              size="sm"
              className="min-w-0 flex-1"
            />

            <Tabs value={sort} onValueChange={(v) => handleSortChange(v as "latest" | "popular")} className="ml-auto shrink-0">
              <TabsList>
                <TabsTrigger value="latest">최신순</TabsTrigger>
                <TabsTrigger value="popular">인기순</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

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
                <MessageSquare className="h-8 w-8" />
                <p>아직 게시글이 없습니다.</p>
                <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
              </div>
            ) : (
              items.map((item) => (
                <FeedListItem key={`${item.type}-${item.data.id}`} item={item} />
              ))
            )}
          </div>

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </section>
  );
}
