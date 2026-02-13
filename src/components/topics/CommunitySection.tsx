"use client";

import { useState } from "react";
import useSWR from "swr";
import { TopicListItem, type TopicListItemProps } from "./TopicListItem";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS } from "@/lib/constants";
import { MessageSquare, ArrowRight } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_LABELS) as [Category, string][];

export function CommunitySection() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const params = new URLSearchParams();
  if (selectedCategory) params.set("category", selectedCategory);
  params.set("sort", sort);
  params.set("limit", "10");

  const { data, error, isLoading } = useSWR<{ data: { topics: TopicListItemProps["topic"][] } }>(
    `/api/topics?${params.toString()}`,
    fetcher
  );

  const topics = data?.data?.topics ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        {/* 모바일: Select 드롭다운 */}
        <div className="sm:hidden">
          <Select
            value={selectedCategory ?? "ALL"}
            onValueChange={(v) => setSelectedCategory(v === "ALL" ? undefined : v as Category)}
          >
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {categories.map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 데스크톱: 기존 칩 버튼 */}
        <div className="hidden sm:flex sm:flex-wrap gap-2">
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
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-[60px] w-[80px] shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground">
            토론 목록을 불러오는데 실패했습니다.
          </div>
        ) : topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8" />
            <p>아직 토론이 없습니다.</p>
            <p className="text-sm">첫 번째 토론을 시작해보세요!</p>
          </div>
        ) : (
          topics.map((topic: TopicListItemProps["topic"]) => (
            <TopicListItem key={topic.id} topic={topic} />
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
