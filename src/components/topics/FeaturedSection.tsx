"use client";

import useSWR from "swr";
import { FeaturedTopicCard, type FeaturedTopicCardProps } from "./FeaturedTopicCard";
import { Loader2, Sparkles } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function FeaturedSection() {
  const { data, error, isLoading } = useSWR(
    "/api/topics?type=featured&limit=2",
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
      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic: FeaturedTopicCardProps["topic"]) => (
          <FeaturedTopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
