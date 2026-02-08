"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatDDay, formatNumber } from "@/lib/utils";
import { Eye, Users } from "lucide-react";
import type { Category } from "@prisma/client";

export interface FeaturedTopicCardProps {
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
    category: Category;
    imageUrl?: string | null;
    deadline?: string | Date | null;
    createdAt: string | Date;
    viewCount: number;
    _count: {
      votes: number;
      opinions: number;
    };
  };
}

export const FeaturedTopicCard = memo(function FeaturedTopicCard({ topic }: FeaturedTopicCardProps) {
  const dDay = formatDDay(topic.deadline ?? null);
  const voteCount = formatNumber(topic._count.votes);

  return (
    <Link href={`/topics/${topic.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
        <div className={`relative aspect-[16/10] w-full overflow-hidden ${topic.imageUrl ? "bg-muted/50" : "bg-gradient-to-br from-sideA/20 to-sideB/20"}`}>
          {topic.imageUrl ? (
            <>
              <Image
                src={topic.imageUrl}
                alt=""
                fill
                sizes="50vw"
                className="object-cover blur-2xl scale-110 opacity-70"
                aria-hidden="true"
              />
              <Image
                src={topic.imageUrl}
                alt={topic.title}
                fill
                className="object-cover z-[1] transition-transform group-hover:scale-105"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              {/* 애니메이션 그라데이션 배경 */}
              <div className="absolute inset-0 bg-gradient-to-br from-sideA/20 via-purple-50 to-sideB/20 transition-all duration-500 group-hover:from-sideA/30 group-hover:to-sideB/30" />

              {/* VS 배지 */}
              <div className="relative z-10 text-center">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-sideA drop-shadow-sm">A</span>
                  <span className="text-2xl font-medium text-muted-foreground/80">vs</span>
                  <span className="text-5xl font-bold text-sideB drop-shadow-sm">B</span>
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">{voteCount}명 투표</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">{formatNumber(topic.viewCount)}회</span>
              </div>
            </div>
          </div>
          {dDay && (
            <div className={`absolute top-2.5 right-2.5 rounded-md px-2 py-1 text-xs font-bold shadow-md ${
              dDay === "마감"
                ? "bg-gray-800/80 text-gray-300"
                : dDay === "D-Day"
                  ? "bg-sideB text-sideB-foreground animate-pulse"
                  : "bg-black/70 text-white backdrop-blur-sm"
            }`}>
              {dDay}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-tight">
            {topic.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-sideA">{topic.optionA}</span>
            <span>vs</span>
            <span className="font-medium text-sideB">{topic.optionB}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
