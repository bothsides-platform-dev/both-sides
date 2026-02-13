"use client";

import useSWR from "swr";
import { TopicCard, type TopicCardProps } from "./TopicCard";
import { TrendingUp } from "lucide-react";
import {
  HorizontalScroll,
  HorizontalScrollItem,
} from "@/components/ui/horizontal-scroll";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[320px] flex-shrink-0">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
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
