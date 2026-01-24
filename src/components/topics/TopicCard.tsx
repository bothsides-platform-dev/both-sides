"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, ImageIcon, MessageSquare, Users } from "lucide-react";
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
    author: {
      id: string;
      nickname?: string | null;
      name?: string | null;
      image?: string | null;
    };
    _count: {
      votes: number;
      opinions: number;
    };
  };
}

export function TopicCard({ topic }: TopicCardProps) {
  const authorName = topic.author.nickname || topic.author.name || "익명";
  const shareDescription = `${topic.optionA} vs ${topic.optionB}`;

  return (
    <div className="relative h-full">
      <Link href={`/topics/${topic.id}`}>
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {topic.imageUrl ? (
              <Image src={topic.imageUrl} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
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
            <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center">
              <span className="text-sm font-medium text-blue-700">
                A. {topic.optionA}
              </span>
            </div>
            <span className="text-lg font-bold text-muted-foreground">VS</span>
            <div className="flex-1 rounded-lg bg-red-50 p-3 text-center">
              <span className="text-sm font-medium text-red-700">
                B. {topic.optionB}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={topic.author.image || undefined} />
              <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{authorName}</span>
          </div>
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
            <span>{formatRelativeTime(topic.createdAt)}</span>
          </div>
        </CardFooter>
        </Card>
      </Link>
      <div className="absolute right-2 top-2 z-10">
        <ShareButton
          url={`/topics/${topic.id}`}
          title={topic.title}
          description={shareDescription}
          variant="icon"
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
        />
      </div>
    </div>
  );
}
