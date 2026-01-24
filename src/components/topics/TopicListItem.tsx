"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, ImageIcon, MessageSquare, Users } from "lucide-react";
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
      className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-md bg-muted">
        {topic.imageUrl ? (
          <Image src={topic.imageUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="min-w-0 flex-1 truncate font-medium">
            {topic.title}
          </h4>
          <span className="shrink-0 text-xs text-muted-foreground md:hidden">
            {topic._count.votes}표 · {topic._count.opinions}의견 · {topic.viewCount}조회
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          <span className="text-blue-600">{topic.optionA}</span>
          <span className="mx-1">vs</span>
          <span className="text-red-600">{topic.optionB}</span>
        </p>
      </div>
      <div className="hidden shrink-0 items-center gap-4 text-sm text-muted-foreground md:flex">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {topic._count.votes}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {topic._count.opinions}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {topic.viewCount}
        </span>
        <span className="hidden md:block md:w-16 md:text-right">
          {formatRelativeTime(topic.createdAt)}
        </span>
      </div>
    </Link>
  );
});
