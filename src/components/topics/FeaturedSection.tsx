"use client";

import useSWR from "swr";
import { FeaturedTopicCard, type FeaturedTopicCardProps } from "./FeaturedTopicCard";
import { Sparkles } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedSection() {
  const { data, error, isLoading } = useSWR<{ data: { topics: FeaturedTopicCardProps["topic"][] } }>(
    "/api/topics?type=featured&limit=10",
    fetcher
  );

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold">오늘의 토론</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[300px] flex-shrink-0">
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
        <Sparkles className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold">오늘의 토론</h2>
      </div>
      <HorizontalScroll>
        {topics.map((topic: FeaturedTopicCardProps["topic"]) => (
          <div key={topic.id} className="flex-shrink-0 w-[300px]">
            <FeaturedTopicCard topic={topic} />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
