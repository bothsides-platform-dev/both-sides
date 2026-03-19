"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  MessageSquare,
  Flag,
  Swords,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { formatRelativeTime } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ChallengeBlockComment } from "@/components/battle/ChallengeBlockComment";
import type { Category } from "@prisma/client";

interface Post {
  id: string;
  title: string;
  category: Category;
  authorId: string;
  isHidden: boolean;
  isAnonymous: boolean;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
  _count: {
    comments: number;
    reports: number;
  };
}

interface PostsResponse {
  data: {
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface StatsResponse {
  data: {
    total: number;
    visible: number;
    hidden: number;
  };
}

interface AdminComment {
  id: string;
  postId: string;
  userId: string | null;
  visitorId: string | null;
  body: string;
  isBlinded: boolean;
  isAnonymous: boolean;
  parentId: string | null;
  battleId: string | null;
  createdAt: string;
  user: {
    id: string;
    nickname: string | null;
    name: string | null;
  } | null;
  battle?: {
    id: string;
    status: string;
    battleTitle: string | null;
    customOptionA: string | null;
    customOptionB: string | null;
    challengerSide: string;
    challengedSide: string;
    challengerHp: number | null;
    challengedHp: number | null;
    durationSeconds: number | null;
    endReason: string | null;
    winnerId: string | null;
    challenger: { id: string; nickname: string | null; name: string | null };
    challenged: { id: string; nickname: string | null; name: string | null };
    winner?: { nickname: string | null; name: string | null } | null;
  } | null;
  reactionSummary: { likes: number; dislikes: number };
  _count: { reactions: number; replies: number; reports: number };
}

interface CommentsResponse {
  data: {
    comments: AdminComment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

function revalidatePosts() {
  mutate((key: unknown) => typeof key === "string" && key.startsWith("/api/admin/posts"));
}

export function AdminPosts() {
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");
  const [category, setCategory] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Comment manager
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentPostTitle, setCommentPostTitle] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [commentStatus, setCommentStatus] = useState<"all" | "visible" | "blinded">("all");
  const [commentDeleteId, setCommentDeleteId] = useState<string | null>(null);
  const [commentDeleteOpen, setCommentDeleteOpen] = useState(false);

  const queryParams = new URLSearchParams({
    page: String(page),
    status,
    ...(category !== "all" && { category }),
    ...(submittedSearch && { search: submittedSearch }),
  });

  const { data, isLoading } = useSWR<PostsResponse>(
    `/api/admin/posts?${queryParams}`,
    fetcher
  );

  const { data: statsData } = useSWR<StatsResponse>(
    "/api/admin/posts?stats=true",
    fetcher
  );

  const commentQueryParams = new URLSearchParams({
    page: String(commentPage),
    status: commentStatus,
  });

  const { data: commentsData, isLoading: commentsLoading } = useSWR<CommentsResponse>(
    commentPostId ? `/api/admin/posts/${commentPostId}/comments?${commentQueryParams}` : null,
    fetcher
  );

  const posts = data?.data.posts ?? [];
  const pagination = data?.data.pagination;
  const stats = statsData?.data;
  const comments = commentsData?.data.comments ?? [];
  const commentPagination = commentsData?.data.pagination;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedSearch(searchInput);
    setPage(1);
  };

  const handleToggleHidden = async (id: string, isHidden: boolean) => {
    setProcessingId(id);
    setProcessingAction("hide");
    try {
      await fetch(`/api/admin/posts/${id}/hide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !isHidden }),
      });
      revalidatePosts();
    } catch (error) {
      console.error("Failed to toggle hidden:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteDialogOpen(false);
    setProcessingId(deleteTargetId);
    setProcessingAction("delete");
    try {
      await fetch(`/api/admin/posts/${deleteTargetId}`, {
        method: "DELETE",
      });
      revalidatePosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setDeleteTargetId(null);
    }
  };

  const handleCommentBlind = async (commentId: string, isBlinded: boolean) => {
    setProcessingId(commentId);
    setProcessingAction("blind");
    try {
      await fetch(`/api/admin/post-comments/${commentId}/blind`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlinded: !isBlinded }),
      });
      mutate((key: unknown) => typeof key === "string" && key.includes("/comments"));
    } catch (error) {
      console.error("Failed to toggle blind:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleCommentDelete = async () => {
    if (!commentDeleteId) return;
    setCommentDeleteOpen(false);
    setProcessingId(commentDeleteId);
    setProcessingAction("commentDelete");
    try {
      await fetch(`/api/admin/post-comments/${commentDeleteId}`, {
        method: "DELETE",
      });
      mutate((key: unknown) => typeof key === "string" && key.includes("/comments"));
      revalidatePosts();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setCommentDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>게시글 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">전체</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="text-lg font-bold text-green-600">{stats.visible}</div>
                <div className="text-xs text-muted-foreground">공개</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div className="text-lg font-bold text-red-600">{stats.hidden}</div>
                <div className="text-xs text-muted-foreground">숨김</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Tabs
                value={status}
                onValueChange={(v) => {
                  setStatus(v as "all" | "visible" | "hidden");
                  setPage(1);
                }}
              >
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="visible">공개</TabsTrigger>
                  <TabsTrigger value="hidden">숨김</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="제목 또는 작성자 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline">
                검색
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Post List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            게시글이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorName = post.isAnonymous
              ? "익명"
              : (post.author.nickname || post.author.name || "알 수 없음");

            return (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Status badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[post.category] || post.category}
                        </Badge>
                        {post.isHidden && (
                          <Badge variant="destructive">숨김</Badge>
                        )}
                      </div>

                      {/* Title */}
                      <Link
                        href={`/posts/${post.id}`}
                        className="font-medium hover:underline flex items-center gap-1 text-sm"
                        target="_blank"
                      >
                        {post.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      {/* Author */}
                      <div className="text-sm text-muted-foreground">
                        작성자: <span className="font-medium text-foreground">{authorName}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>조회 {post.viewCount}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post._count.comments}
                        </span>
                        {post._count.reports > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Flag className="h-3 w-3" />
                            {post._count.reports}
                          </span>
                        )}
                        <span suppressHydrationWarning>
                          {formatRelativeTime(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleHidden(post.id, post.isHidden)}
                        disabled={processingId === post.id}
                        title={post.isHidden ? "공개하기" : "숨기기"}
                      >
                        {processingId === post.id && processingAction === "hide" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : post.isHidden ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      {post._count.comments > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCommentPostId(post.id);
                            setCommentPostTitle(post.title);
                            setCommentPage(1);
                            setCommentStatus("all");
                          }}
                          title="댓글 관리"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDeleteTargetId(post.id);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={processingId === post.id}
                        className="text-destructive hover:text-destructive"
                        title="삭제"
                      >
                        {processingId === post.id && processingAction === "delete" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        title="상세 보기"
                      >
                        <Link href={`/posts/${post.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages} 페이지 (총 {pagination.total}개)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Comment Manager Dialog */}
      <Dialog
        open={!!commentPostId}
        onOpenChange={(open) => {
          if (!open) setCommentPostId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>댓글 관리</DialogTitle>
            <DialogDescription className="truncate">
              {commentPostTitle}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={commentStatus}
            onValueChange={(v) => {
              setCommentStatus(v as "all" | "visible" | "blinded");
              setCommentPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="visible">공개</TabsTrigger>
              <TabsTrigger value="blinded">블라인드</TabsTrigger>
            </TabsList>
          </Tabs>

          {commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              댓글이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const commentAuthor = comment.isAnonymous
                  ? "익명"
                  : (comment.user?.nickname || comment.user?.name || "게스트");
                const isChallengeComment = !!comment.battleId;

                return (
                  <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                    {isChallengeComment && comment.battle ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Swords className="h-3 w-3 text-orange-500" />
                          <span>맞짱 도전 댓글</span>
                          {comment.isBlinded && <Badge variant="destructive" className="text-[10px]">블라인드</Badge>}
                        </div>
                        <ChallengeBlockComment battle={comment.battle} />
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/battles/${comment.battle.id}`}
                            target="_blank"
                            className="text-xs text-orange-600 hover:underline flex items-center gap-1"
                          >
                            배틀 상세
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{commentAuthor}</span>
                            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                            {comment.isBlinded && (
                              <Badge variant="destructive" className="text-[10px]">블라인드</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {comment.body}
                        </p>
                      </>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>좋아요 {comment.reactionSummary.likes}</span>
                      <span>싫어요 {comment.reactionSummary.dislikes}</span>
                      <span>답글 {comment._count.replies}</span>
                      {comment._count.reports > 0 && (
                        <span className="text-red-500">신고 {comment._count.reports}</span>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleCommentBlind(comment.id, comment.isBlinded)}
                          disabled={processingId === comment.id}
                        >
                          {processingId === comment.id && processingAction === "blind" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : comment.isBlinded ? (
                            <><Eye className="h-3 w-3 mr-1" />공개</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" />블라인드</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => {
                            setCommentDeleteId(comment.id);
                            setCommentDeleteOpen(true);
                          }}
                          disabled={processingId === comment.id}
                        >
                          {processingId === comment.id && processingAction === "commentDelete" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment Pagination */}
          {commentPagination && commentPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommentPage((p) => Math.max(1, p - 1))}
                disabled={commentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {commentPage} / {commentPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommentPage((p) => Math.min(commentPagination.totalPages, p + 1))}
                disabled={commentPage === commentPagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시글 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 게시글을 삭제하시겠습니까? 관련된 댓글, 신고가 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Dialog */}
      <Dialog open={commentDeleteOpen} onOpenChange={setCommentDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDeleteOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleCommentDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
