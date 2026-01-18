"use client";

import useSWR from "swr";
import { TopicCard } from "./TopicCard";
import { Loader2 } from "lucide-react";
import type { Category } from "@prisma/client";
import type { TopicCardProps } from "./TopicCard";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TopicListProps {
  category?: Category;
  sort?: "latest" | "popular";
}

export function TopicList({ category, sort = "latest" }: TopicListProps) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("sort", sort);

  const { data, error, isLoading } = useSWR(
    `/api/topics?${params.toString()}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        토론 목록을 불러오는데 실패했습니다.
      </div>
    );
  }

  const topics = data?.data?.topics ?? [];

  if (topics.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        아직 토론이 없습니다. 첫 번째 토론을 시작해보세요!
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {topics.map((topic: TopicCardProps["topic"]) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
