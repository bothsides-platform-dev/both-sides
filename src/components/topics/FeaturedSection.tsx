"use client";

import useSWR from "swr";
import { FeaturedTopicCard, type FeaturedTopicCardProps } from "./FeaturedTopicCard";
import { Loader2, Sparkles } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { HorizontalScroll } from "@/components/ui/horizontal-scroll";

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
        <Sparkles className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold">오늘의 토론</h2>
      </div>
      <HorizontalScroll>
        {topics.map((topic: FeaturedTopicCardProps["topic"]) => (
          <div key={topic.id} className="flex-1 flex-shrink-0 min-w-[300px]">
            <FeaturedTopicCard topic={topic} />
          </div>
        ))}
      </HorizontalScroll>
    </section>
  );
}
