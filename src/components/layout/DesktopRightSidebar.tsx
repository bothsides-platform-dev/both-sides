"use client";

import Link from "next/link";
import useSWR from "swr";
import { TrendingUp, Users, MessageSquare, Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";

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

export function DesktopRightSidebar() {
  const { data, isLoading } = useSWR<{ data: { topics: TrendingTopic[] } }>(
    "/api/topics?type=recommended&limit=5",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const topics = data?.data?.topics ?? [];

  return (
    <aside className="hidden xl:block xl:w-[280px] xl:fixed xl:right-0 xl:top-0 xl:bottom-0 xl:z-30 xl:border-l xl:bg-background xl:pt-4 xl:overflow-y-auto">
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

      {/* Quick Info */}
      <div className="px-4 pt-4 border-t">
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <h4 className="text-sm font-semibold">BothSides</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A vs B, 당신의 선택은? 양자택일 토론에 참여하고 다양한 의견을 나눠보세요.
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">양자택일</Badge>
            <Badge variant="secondary" className="text-xs">토론</Badge>
            <Badge variant="secondary" className="text-xs">투표</Badge>
          </div>
        </div>
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
