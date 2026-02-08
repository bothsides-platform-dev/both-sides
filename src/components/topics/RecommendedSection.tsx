"use client";

import useSWR from "swr";
import { TopicCard, type TopicCardProps } from "./TopicCard";
import { Loader2, TrendingUp } from "lucide-react";
import {
  HorizontalScroll,
  HorizontalScrollItem,
} from "@/components/ui/horizontal-scroll";
import { fetcher } from "@/lib/fetcher";

export function RecommendedSection() {
  const { data, error, isLoading } = useSWR<{ data: { topics: TopicCardProps["topic"][] } }>(
    "/api/topics?type=recommended&limit=10",
    fetcher
  );

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h2 className="text-xl font-bold">인기 토론</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  const topics = data?.data?.topics ?? [];

  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <h2 className="text-xl font-bold">인기 토론</h2>
      </div>
      <HorizontalScroll>
        {topics.map((topic: TopicCardProps["topic"]) => (
          <HorizontalScrollItem key={topic.id} className="w-[320px]">
            <TopicCard topic={topic} />
          </HorizontalScrollItem>
        ))}
      </HorizontalScroll>
    </section>
  );
}
