"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, MessageSquare, Users } from "lucide-react";
import { CATEGORY_META } from "@/lib/constants";
import type { Category } from "@prisma/client";

export interface TopicListItemProps {
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
    category: Category;
    createdAt: string | Date;
    imageUrl?: string | null;
    viewCount: number;
    _count: {
      votes: number;
      opinions: number;
    };
  };
}

export const TopicListItem = memo(function TopicListItem({ topic }: TopicListItemProps) {
  return (
    <Link
      href={`/topics/${topic.id}`}
      className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      <div className={`relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-md hidden md:block ${topic.imageUrl ? "bg-muted/50" : "bg-gradient-to-r from-blue-50 to-red-50"}`}>
        {topic.imageUrl ? (
          <>
            <Image
              src={topic.imageUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover blur-2xl scale-110 opacity-70"
              aria-hidden="true"
            />
            <Image
              src={topic.imageUrl}
              alt={topic.title}
              fill
              className="object-cover z-[1]"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            {/* 좌우 분할 배경 */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-blue-100 to-blue-50" />
              <div className="flex-1 bg-gradient-to-l from-red-100 to-red-50" />
            </div>

            {/* 컴팩트 A vs B */}
            <div className="relative z-10 flex items-center gap-1">
              <span className="text-xs font-bold text-sideA">A</span>
              <span className="text-2xs text-muted-foreground">vs</span>
              <span className="text-xs font-bold text-sideB">B</span>
            </div>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {(() => {
              const meta = CATEGORY_META[topic.category];
              const Icon = meta.icon;
              return (
                <span className={`hidden md:inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-2xs font-medium ${meta.bgColor} ${meta.color}`}>
                  <Icon className="h-3 w-3" aria-hidden="true" />
                  {meta.label}
                </span>
              );
            })()}
            <h4 className="min-w-0 flex-1 truncate font-medium">
              {topic.title}
            </h4>
          </div>
          <span className="shrink-0 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
            <span className="flex items-center gap-0.5"><Users className="h-3 w-3" aria-hidden="true" /><span className="sr-only">투표</span>{topic._count.votes}</span>
            <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" aria-hidden="true" /><span className="sr-only">의견</span>{topic._count.opinions}</span>
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          <span className="text-sideA">{topic.optionA}</span>
          <span className="mx-1">vs</span>
          <span className="text-sideB">{topic.optionB}</span>
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 text-sm text-muted-foreground md:flex">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">투표</span>
          {topic._count.votes}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">의견</span>
          {topic._count.opinions}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">조회</span>
          {topic.viewCount}
        </span>
        <span className="hidden md:block md:w-16 md:text-right" suppressHydrationWarning>
          {formatRelativeTime(topic.createdAt)}
        </span>
      </div>
    </Link>
  );
});
