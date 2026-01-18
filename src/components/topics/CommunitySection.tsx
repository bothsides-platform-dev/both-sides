"use client";

import { useState } from "react";
import useSWR from "swr";
import { TopicListItem, type TopicListItemProps } from "./TopicListItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Loader2, MessageSquare } from "lucide-react";
import type { Category } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const categories = Object.entries(CATEGORY_LABELS) as [Category, string][];

export function CommunitySection() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const params = new URLSearchParams();
  if (selectedCategory) params.set("category", selectedCategory);
  params.set("sort", sort);
  params.set("limit", "20");

  const { data, error, isLoading } = useSWR(
    `/api/topics?${params.toString()}`,
    fetcher
  );

  const topics = data?.data?.topics ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-500" />
        <h2 className="text-xl font-bold">커뮤니티 토론</h2>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
          >
            전체
          </Button>
          {categories.map(([value, label]) => (
            <Button
              key={value}
              variant={selectedCategory === value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "popular")} className="ml-auto">
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
            아직 토론이 없습니다. 첫 번째 토론을 시작해보세요!
          </div>
        ) : (
          topics.map((topic: TopicListItemProps["topic"]) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))
        )}
      </div>
    </section>
  );
}
