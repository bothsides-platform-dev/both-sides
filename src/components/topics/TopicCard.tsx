"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Eye, MessageSquare, Users, User, Ban } from "lucide-react";
import { ShareButton } from "@/components/ui/ShareButton";
import type { Category } from "@prisma/client";

export interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
    category: Category;
    createdAt: string | Date;
    imageUrl?: string | null;
    viewCount: number;
    isAnonymous?: boolean;
    author: {
      id: string;
      nickname?: string | null;
      name?: string | null;
      image?: string | null;
      isBlacklisted?: boolean;
    };
    _count: {
      votes: number;
      opinions: number;
    };
  };
}

export const TopicCard = memo(function TopicCard({ topic }: TopicCardProps) {
  const authorName = topic.isAnonymous 
    ? "익명" 
    : (topic.author.nickname || topic.author.name || "익명");
  const shareDescription = `${topic.optionA} vs ${topic.optionB}`;

  return (
    <div className="relative h-full">
      <Link href={`/topics/${topic.id}`}>
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-950/40 dark:to-red-950/40">
            {topic.imageUrl ? (
              <Image src={topic.imageUrl} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                {/* 대각선 분할 배경 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tl from-red-500/20 via-transparent to-transparent" />

                {/* 중앙 VS 배지 */}
                <div className="relative z-10 flex items-center gap-2 rounded-full bg-white/90 dark:bg-background/90 px-4 py-2 shadow-sm">
                  <span className="text-lg font-bold text-blue-600">A</span>
                  <span className="text-sm font-medium text-muted-foreground">vs</span>
                  <span className="text-lg font-bold text-red-600">B</span>
                </div>
              </div>
            )}
          </div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight">
              {topic.title}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {CATEGORY_LABELS[topic.category]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                A. {topic.optionA}
              </span>
            </div>
            <span className="text-lg font-bold text-muted-foreground">VS</span>
            <div className="flex-1 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-center">
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                B. {topic.optionB}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          {topic.isAnonymous ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{authorName}</span>
            </div>
          ) : (
            <Link
              href={`/users/${topic.author.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:underline"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={topic.author.image || undefined} />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{authorName}</span>
              {topic.author.isBlacklisted && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 text-destructive border-destructive/50">
                  <Ban className="h-2.5 w-2.5 mr-0.5" />
                  차단됨
                </Badge>
              )}
            </Link>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
          </div>
        </CardFooter>
        </Card>
      </Link>
      <div className="absolute right-2 top-2 z-10">
        <ShareButton
          url={`/topics/${topic.id}`}
          title={topic.title}
          description={shareDescription}
          imageUrl={topic.imageUrl || `/topics/${topic.id}/opengraph-image`}
          variant="icon"
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
        />
      </div>
    </div>
  );
});
