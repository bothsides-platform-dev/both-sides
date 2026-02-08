"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Loader2, TrendingUp, ChevronRight } from "lucide-react";
import type { Category } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { CATEGORY_META, CATEGORY_TO_SLUG } from "@/lib/constants";
import { TopicListItem, type TopicListItemProps } from "@/components/topics/TopicListItem";

interface RelatedTopicsProps {
  topicId: string;
  category: Category;
}

interface TopicsResponse {
  data: {
    topics: TopicListItemProps["topic"][];
    total: number;
    page: number;
    totalPages: number;
  };
}

const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
};

export function RelatedTopics({ topicId, category }: RelatedTopicsProps) {
  const { data: categoryData, isLoading: categoryLoading } = useSWR<TopicsResponse>(
    `/api/topics?category=${category}&sort=popular&limit=5`,
    fetcher,
    swrOptions,
  );

  const { data: popularData, isLoading: popularLoading } = useSWR<TopicsResponse>(
    `/api/topics?sort=popular&limit=5`,
    fetcher,
    swrOptions,
  );

  const { categoryTopics, popularTopics } = useMemo(() => {
    const catTopics = (categoryData?.data?.topics ?? []).filter((t) => t.id !== topicId).slice(0, 4);
    const catIds = new Set(catTopics.map((t) => t.id));
    const popTopics = (popularData?.data?.topics ?? [])
      .filter((t) => t.id !== topicId && !catIds.has(t.id))
      .slice(0, 4);
    return { categoryTopics: catTopics, popularTopics: popTopics };
  }, [categoryData, popularData, topicId]);

  const isLoading = categoryLoading || popularLoading;
  const hasContent = categoryTopics.length > 0 || popularTopics.length > 0;

  if (isLoading) {
    return (
      <section className="border-t border-border pt-5 md:pt-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (!hasContent) return null;

  const CategoryIcon = CATEGORY_META[category].icon;
  const categorySlug = CATEGORY_TO_SLUG[category];

  return (
    <section className="border-t border-border pt-5 md:pt-8 space-y-6">
      {categoryTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CategoryIcon className={`h-5 w-5 ${CATEGORY_META[category].color}`} />
            <h3 className="font-semibold">같은 카테고리 토론</h3>
          </div>
          <div className="divide-y rounded-lg border bg-card">
            {categoryTopics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </div>
          <Link
            href={`/explore?category=${categorySlug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            더 보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {popularTopics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">인기 토론</h3>
          </div>
          <div className="divide-y rounded-lg border bg-card">
            {popularTopics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} />
            ))}
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            더 보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
