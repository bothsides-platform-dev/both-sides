"use client";

import useSWR from "swr";
import { TopicCard, type TopicCardProps } from "./TopicCard";
import { Loader2, Star } from "lucide-react";
import {
  HorizontalScroll,
  HorizontalScrollItem,
} from "@/components/ui/horizontal-scroll";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RecommendedSection() {
  const { data, error, isLoading } = useSWR(
    "/api/topics?type=recommended&limit=10",
    fetcher
  );

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">추천 토론</h2>
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
        <Star className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl font-bold">추천 토론</h2>
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
