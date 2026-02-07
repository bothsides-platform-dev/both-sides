"use client";

import Link from "next/link";
import useSWR from "swr";
import { TrendingUp, Users, MessageSquare, MessageCircle, Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

interface TrendingTopic {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  _count: {
    votes: number;
    opinions: number;
  };
}

interface RecentOpinion {
  id: string;
  topicId: string;
  side: "A" | "B";
  body: string;
  isAnonymous: boolean;
  createdAt: string;
  user: {
    nickname: string | null;
    name: string | null;
    image: string | null;
  } | null;
  topic: {
    id: string;
    title: string;
  };
}

export function DesktopRightSidebar() {
  const { data, isLoading } = useSWR<{ data: { topics: TrendingTopic[] } }>(
    "/api/topics?type=recommended&limit=5",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const { data: opinionsData, isLoading: opinionsLoading } = useSWR<{ data: { opinions: RecentOpinion[] } }>(
    "/api/opinions?type=recent&limit=5",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const topics = data?.data?.topics ?? [];
  const opinions = opinionsData?.data?.opinions ?? [];

  return (
    <aside className="hidden xl:block xl:w-[280px] xl:fixed xl:right-0 xl:top-16 xl:bottom-0 xl:z-30 xl:border-l xl:bg-background xl:pt-4 xl:overflow-y-auto">
      {/* Trending Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <h3 className="text-sm font-semibold">인기 토론</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">토론이 없습니다.</p>
        ) : (
          <div className="space-y-1">
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}`}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-accent group"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-bold text-muted-foreground mt-0.5 shrink-0 w-4 text-right">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-accent-foreground">
                      {topic.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {topic._count.votes}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" />
                        {topic._count.opinions}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Opinions Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold">최근 의견</h3>
        </div>

        {opinionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : opinions.length === 0 ? (
          <p className="text-sm text-muted-foreground">의견이 없습니다.</p>
        ) : (
          <div className="space-y-1">
            {opinions.map((opinion) => {
              const authorName = !opinion.user
                ? "손님"
                : opinion.isAnonymous
                  ? "익명"
                  : opinion.user.nickname || opinion.user.name || "손님";

              return (
                <Link
                  key={opinion.id}
                  href={`/topics/${opinion.topicId}`}
                  className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-accent group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant={opinion.side === "A" ? "sideA" : "sideB"} className="text-[10px] px-1.5 py-0 h-4">
                      {opinion.side}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {authorName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      · {formatRelativeTime(opinion.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-snug line-clamp-2 group-hover:text-accent-foreground">
                    {opinion.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {opinion.topic.title}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 pt-4 pb-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BothSides
        </p>
      </div>
    </aside>
  );
}
