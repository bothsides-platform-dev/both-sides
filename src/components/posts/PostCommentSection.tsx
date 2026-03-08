"use client";

import { useState } from "react";
import useSWR from "swr";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { PostCommentForm } from "./PostCommentForm";
import { PostCommentItem } from "./PostCommentItem";

interface PostCommentSectionProps {
  postId: string;
}

interface PostCommentData {
  id: string;
  postId: string;
  userId: string | null;
  visitorId: string | null;
  body: string;
  isBlinded: boolean;
  isAnonymous: boolean;
  parentId: string | null;
  createdAt: string;
  user: {
    id: string;
    nickname: string | null;
    name: string | null;
    image: string | null;
    selectedBadgeId: string | null;
  } | null;
  reactionSummary: { likes: number; dislikes: number };
  _count: { reactions: number; replies: number };
}

interface CommentsResponse {
  data: {
    comments: PostCommentData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function PostCommentSection({ postId }: PostCommentSectionProps) {
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [page, setPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR<CommentsResponse>(
    `/api/posts/${postId}/comments?sort=${sort}&page=${page}&limit=20&parentId=null`,
    fetcher
  );

  const comments = data?.data?.comments ?? [];
  const pagination = data?.data?.pagination;
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageSquare className="h-5 w-5" />
          댓글 {pagination?.total ? `(${pagination.total})` : ""}
        </h2>
        <Tabs value={sort} onValueChange={(v) => { setSort(v as "latest" | "hot"); setPage(1); }}>
          <TabsList>
            <TabsTrigger value="latest">최신순</TabsTrigger>
            <TabsTrigger value="hot">인기순</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Comment Form */}
      <PostCommentForm
        postId={postId}
        onSuccess={() => mutate()}
      />

      {/* Comment List */}
      <div className="divide-y">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-muted-foreground">
            댓글을 불러오는데 실패했습니다.
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>아직 댓글이 없습니다.</p>
            <p className="text-sm">첫 번째 댓글을 남겨보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <PostCommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onMutate={() => mutate()}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            더 보기
          </Button>
        </div>
      )}
    </section>
  );
}
