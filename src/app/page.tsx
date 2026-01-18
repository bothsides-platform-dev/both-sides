"use client";

import { useState } from "react";
import { TopicList } from "@/components/topics/TopicList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category } from "@prisma/client";

const categories = Object.entries(CATEGORY_LABELS) as [Category, string][];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          <span className="text-blue-500">A</span> vs{" "}
          <span className="text-red-500">B</span>, 당신의 선택은?
        </h1>
        <p className="text-muted-foreground">
          양자택일 토론에 참여하고 의견을 나눠보세요
        </p>
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

      <TopicList category={selectedCategory} sort={sort} />
    </div>
  );
}
