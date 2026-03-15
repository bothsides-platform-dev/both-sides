"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, MessageSquare, Flag, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostCommentForm } from "./PostCommentForm";
import { ChallengeBlockComment } from "@/components/battle/ChallengeBlockComment";
import { PostChallengeButton } from "@/components/battle/PostChallengeButton";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import type { PostCommentData } from "@/types/post-comments";

interface PostCommentItemProps {
  comment: PostCommentData;
  postId: string;
  onMutate: () => void;
  depth?: number;
}

export function PostCommentItem({ comment, postId, onMutate, depth = 0 }: PostCommentItemProps) {
  const { data: session } = useSession();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const { data: repliesData, mutate: mutateReplies } = useSWR<{
    data: { comments: PostCommentData[] };
  }>(
    showReplies ? `/api/posts/${postId}/comments?parentId=${comment.id}&limit=100` : null,
    fetcher
  );

  const replies = repliesData?.data?.comments ?? [];

  const authorName = comment.isAnonymous
    ? "익명"
    : (comment.user?.nickname || comment.user?.name || "익명");

  const handleReaction = async (type: "LIKE" | "DISLIKE") => {
    if (isReacting) return;
    setIsReacting(true);
    try {
      await fetch(`/api/post-comments/${comment.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      onMutate();
    } catch {
      // ignore
    } finally {
      setIsReacting(false);
    }
  };

  const handleReport = async () => {
    if (!session?.user) return;
    const reason = window.prompt("신고 사유를 입력하세요");
    if (!reason) return;

    try {
      await fetch(`/api/post-comments/${comment.id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      alert("신고가 접수되었습니다.");
    } catch {
      alert("신고에 실패했습니다.");
    }
  };

  if (comment.isBlinded) {
    return (
      <div className={cn("py-3", depth > 0 && "ml-6 border-l-2 border-muted pl-4")}>
        <p className="text-sm text-muted-foreground italic">블라인드 처리된 댓글입니다.</p>
      </div>
    );
  }

  return (
    <div className={cn("py-3", depth > 0 && "ml-6 border-l-2 border-muted pl-4")}>
      {/* Author */}
      <div className="flex items-center gap-2 mb-1">
        {comment.isAnonymous || !comment.user?.image ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
        ) : (
          <Image
            src={comment.user.image}
            alt={authorName}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span className="text-sm font-medium">{authorName}</span>
        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>

      {/* Body — or Challenge Block */}
      {comment.battleId && comment.battle ? (
        <div className="mb-2">
          <ChallengeBlockComment battle={comment.battle} />
        </div>
      ) : (
        <p className="text-sm whitespace-pre-line mb-2">{comment.body}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => handleReaction("LIKE")}
          disabled={isReacting}
        >
          <ThumbsUp className="h-3 w-3" />
          {comment.reactionSummary.likes > 0 && comment.reactionSummary.likes}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => handleReaction("DISLIKE")}
          disabled={isReacting}
        >
          <ThumbsDown className="h-3 w-3" />
          {comment.reactionSummary.dislikes > 0 && comment.reactionSummary.dislikes}
        </Button>

        {depth < 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <MessageSquare className="h-3 w-3" />
            답글
          </Button>
        )}

        {comment._count.replies > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            답글 {comment._count.replies}개
          </Button>
        )}

        {session?.user && comment.userId && session.user.id !== comment.userId && !comment.battleId && (
          <PostChallengeButton
            postId={postId}
            commentId={comment.id}
            commentUserId={comment.userId}
            commentUserName={comment.isAnonymous ? "익명" : (comment.user?.nickname || comment.user?.name || "익명")}
            onSuccess={() => {
              setShowReplies(true);
              mutateReplies();
              onMutate();
            }}
          />
        )}

        {session?.user && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleReport}
          >
            <Flag className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 ml-6">
          <PostCommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => {
              setShowReplyForm(false);
              setShowReplies(true);
              mutateReplies();
              onMutate();
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder="답글을 입력하세요..."
          />
        </div>
      )}

      {/* Replies */}
      {showReplies && replies.map((reply) => (
        <PostCommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          onMutate={() => {
            mutateReplies();
            onMutate();
          }}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
