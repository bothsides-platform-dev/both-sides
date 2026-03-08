"use client";

import { useState } from "react";
import useSWR from "swr";
import { TopicListItem, type TopicListItemProps } from "./TopicListItem";
import { PostListItem, type PostListItemProps } from "@/components/posts/PostListItem";
import { FeedListItem, type FeedItem } from "@/components/feed/FeedListItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryChips } from "@/components/ui/CategoryChips";
import { MessageSquare, ArrowRight } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { Category } from "@prisma/client";

type ContentType = "all" | "debate" | "post";

export function CommunitySection() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [contentType, setContentType] = useState<ContentType>("all");

  const params = new URLSearchParams();
  if (selectedCategory) params.set("category", selectedCategory);
  params.set("sort", sort);
  params.set("limit", "10");

  // Build API URL based on content type
  let apiUrl: string;
  if (contentType === "all") {
    params.set("type", "all");
    apiUrl = `/api/feed?${params.toString()}`;
  } else if (contentType === "debate") {
    apiUrl = `/api/topics?${params.toString()}`;
  } else {
    apiUrl = `/api/posts?${params.toString()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, isLoading } = useSWR<{ data: any }>(apiUrl, fetcher);

  // Normalize data based on content type
  let items: FeedItem[] = [];
  if (data?.data) {
    if (contentType === "all") {
      items = (data.data.items ?? []) as FeedItem[];
    } else if (contentType === "debate") {
      items = ((data.data.topics ?? []) as TopicListItemProps["topic"][]).map((t) => ({
        type: "topic" as const,
        data: t,
      }));
    } else {
      items = ((data.data.posts ?? []) as PostListItemProps["post"][]).map((p) => ({
        type: "post" as const,
        data: p,
      }));
    }
  }

  return (
    <section className="space-y-4">
      {/* Content Type Tabs */}
      <div className="flex items-center gap-4">
        <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="shrink-0">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="debate">토론</TabsTrigger>
            <TabsTrigger value="post">자유글</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-4">
        <CategoryChips
          value={selectedCategory}
          onChange={setSelectedCategory}
          size="sm"
          className="min-w-0 flex-1"
        />

        <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "popular")} className="ml-auto shrink-0">
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

      <div className="flex justify-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          더 보기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
