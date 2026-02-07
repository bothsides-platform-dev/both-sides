"use client";

import { useState } from "react";
import useSWR from "swr";
import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
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

interface CategoryTopicListProps {
  category: Category;
}

export function CategoryTopicList({ category }: CategoryTopicListProps) {
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = new URLSearchParams({
    category,
    sort,
    page: String(page),
    limit: String(limit),
  });

  const { data, error, isLoading } = useSWR<TopicsResponse>(
    `/api/topics?${params.toString()}`,
    fetcher
  );

  const topics = data?.data?.topics ?? [];
  const pagination = data?.data?.pagination;
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const handleSortChange = (value: string) => {
    setSort(value as "latest" | "popular");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs value={sort} onValueChange={handleSortChange}>
          <TabsList>
            <TabsTrigger value="latest">최신순</TabsTrigger>
            <TabsTrigger value="popular">인기순</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
            아직 이 카테고리에 토론이 없습니다.
          </div>
        ) : (
          topics.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))
        )}
      </div>

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
