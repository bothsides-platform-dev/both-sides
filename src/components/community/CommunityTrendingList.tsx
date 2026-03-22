"use client";

import { useState } from "react";
import useSWR from "swr";
import { ExternalLink, Eye, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import type { CommunityTrendingPost, SiteName } from "@/types/community-trending";
import { SITE_META } from "@/types/community-trending";

interface CommunityTrendingResponse {
  data: {
    posts: CommunityTrendingPost[];
    collectedAt: string;
  };
}

function stripHtml(html: string, maxLength: number = 200): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .slice(0, maxLength)
    .trim();
}

interface TrendingItemProps {
  post: CommunityTrendingPost;
}

function TrendingItem({ post }: TrendingItemProps) {
  const siteMeta = SITE_META[post.sourceSite];
  const preview = stripHtml(post.content, 150);

  return (
    <a
      href={post.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-medium ${siteMeta.bgColor} ${siteMeta.color}`}>
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              {siteMeta.displayName}
            </span>
            {post.category && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-2xs font-medium text-muted-foreground">
                {post.category}
              </span>
            )}
            <h4 className="min-w-0 flex-1 truncate font-medium group-hover:text-primary transition-colors">
              {post.title}
            </h4>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
        </div>
        {preview && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {preview}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          {post.author && (
            <span className="truncate max-w-[120px]">{post.author}</span>
          )}
          {post.viewCount !== undefined && (
            <span className="flex items-center gap-0.5 shrink-0">
              <Eye className="h-3 w-3" />
              {post.viewCount.toLocaleString()}
            </span>
          )}
          {post.commentCount !== undefined && (
            <span className="flex items-center gap-0.5 shrink-0">
              <MessageSquare className="h-3 w-3" />
              {post.commentCount.toLocaleString()}
            </span>
          )}
          {post.likeCount !== undefined && (
            <span className="flex items-center gap-0.5 shrink-0">
              <ThumbsUp className="h-3 w-3" />
              {post.likeCount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <div className="hidden shrink-0 items-center text-sm text-muted-foreground md:flex">
        <span className="w-16 text-right" suppressHydrationWarning>
          {formatRelativeTime(post.collectedAt)}
        </span>
      </div>
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommunityTrendingList() {
  const [selectedSite, setSelectedSite] = useState<SiteName | undefined>(undefined);

  const { data, error, isLoading } = useSWR<CommunityTrendingResponse>(
    "/api/community-trending",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  const posts = data?.data?.posts ?? [];
  const filteredPosts = selectedSite
    ? posts.filter((post) => post.sourceSite === selectedSite)
    : posts;

  return (
    <div className="space-y-4">
      {/* Site filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedSite(undefined)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedSite === undefined
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          전체
        </button>
        {(Object.keys(SITE_META) as SiteName[]).map((site) => {
          const meta = SITE_META[site];
          const count = posts.filter((p) => p.sourceSite === site).length;
          return (
            <button
              key={site}
              onClick={() => setSelectedSite(site)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedSite === site
                  ? `${meta.bgColor} ${meta.color}`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {meta.displayName} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Posts list */}
      <div className="divide-y rounded-lg border bg-card">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground">
            커뮤니티 인기글을 불러오는데 실패했습니다.
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <TrendingUp className="h-8 w-8" />
            <p>
              {selectedSite
                ? `${SITE_META[selectedSite].displayName}의 인기글이 없습니다.`
                : "아직 인기글이 없습니다."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => <TrendingItem key={post.id} post={post} />)
        )}
      </div>

      {data?.data?.collectedAt && (
        <p className="text-center text-xs text-muted-foreground" suppressHydrationWarning>
          마지막 수집: {formatRelativeTime(data.data.collectedAt)}
        </p>
      )}
    </div>
  );
}
