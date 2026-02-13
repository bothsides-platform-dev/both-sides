"use client";

import Link from "next/link";
import useSWR from "swr";
import { MessageCircle, Loader2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

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
  const { data: opinionsData, isLoading: opinionsLoading } = useSWR<{ data: { opinions: RecentOpinion[] } }>(
    "/api/opinions?type=recent&limit=10",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const opinions = opinionsData?.data?.opinions ?? [];

  return (
    <aside className="hidden xl:block xl:w-[280px] xl:fixed xl:right-0 xl:top-16 xl:bottom-0 xl:z-30 xl:border-l xl:bg-background xl:pt-4 xl:overflow-y-auto">
      {/* Recent Opinions Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-4 w-4 text-sideA" />
          <h3 className="text-sm font-semibold">최근 의견</h3>
        </div>

        {opinionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : opinions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <MessageCircle className="h-6 w-6" />
            <p className="text-sm">아직 의견이 없습니다.</p>
            <p className="text-xs">토론에 참여하고 의견을 남겨보세요.</p>
          </div>
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
                  href={`/topics/${opinion.topicId}?highlightReply=${opinion.id}`}
                  className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-accent group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant={opinion.side === "A" ? "sideA" : "sideB"} className="text-2xs px-1.5 py-0 h-4">
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

    </aside>
  );
}
