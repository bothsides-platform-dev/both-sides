"use client";

import { memo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, Eye, EyeOff, User, MoreVertical, Flag, MessageCircle, ChevronDown, ChevronUp, Loader2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { ReportDialog } from "./ReportDialog";
import { ReplyForm } from "./ReplyForm";
import type { Opinion } from "./types";
import type { ReactionType, Side } from "@prisma/client";

interface OpinionItemProps {
  opinion: Opinion;
  optionA: string;
  optionB: string;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
  showSideBorder?: boolean;
  onReportSuccess?: () => void;
  depth?: number;
  onReplySuccess?: () => void;
  showRepliesCount?: boolean;
  userVoteSide?: Side;
  onToggleReplies?: () => void;
  showRepliesExpanded?: boolean;
  loadingReplies?: boolean;
  hasReplies?: boolean;
  isHighlighted?: boolean;
}

export const OpinionItem = memo(function OpinionItem({
  opinion,
  optionA,
  optionB,
  currentUserId,
  onReaction,
  onReportSuccess,
  depth = 0,
  onReplySuccess,
  showRepliesCount = false,
  userVoteSide,
  onToggleReplies,
  showRepliesExpanded = false,
  loadingReplies = false,
  hasReplies = false,
  isHighlighted = false,
}: OpinionItemProps) {
  const { data: session } = useSession();
  const [isAnonymous, setIsAnonymous] = useState(opinion.isAnonymous ?? false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [highlightVisible, setHighlightVisible] = useState(isHighlighted);
  const itemRef = useRef<HTMLDivElement>(null);

  // Handle scroll to highlighted item and fade out animation
  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      // Small delay to ensure DOM is ready and parent threads are expanded
      const scrollTimeout = setTimeout(() => {
        itemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);

      // Fade out highlight after 3 seconds
      const fadeTimeout = setTimeout(() => {
        setHighlightVisible(false);
      }, 3000);

      return () => {
        clearTimeout(scrollTimeout);
        clearTimeout(fadeTimeout);
      };
    }
  }, [isHighlighted]);

  const authorName = isAnonymous 
    ? "익명" 
    : (opinion.user.nickname || opinion.user.name || "익명");
  const sideLabel = opinion.side === "A" ? optionA : optionB;
  const isOwner = currentUserId === opinion.user.id;

  // Check if current user has reacted
  const userReaction = opinion.reactions.find((r) => r.userId === currentUserId);

  const repliesCount = opinion._count?.replies || 0;

  const handleToggleAnonymity = async () => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/opinions/${opinion.id}/anonymity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: !isAnonymous }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "익명 상태 변경에 실패했습니다.");
      }

      setIsAnonymous(!isAnonymous);
    } catch (error) {
      console.error("Failed to toggle anonymity:", error);
      alert(error instanceof Error ? error.message : "익명 상태 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReplyClick = () => {
    if (!session?.user) {
      alert("로그인이 필요합니다.");
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplyCountClick = () => {
    if (hasReplies && onToggleReplies) {
      onToggleReplies();
    } else {
      handleReplyClick();
    }
  };

  const handleReplySubmitSuccess = () => {
    setShowReplyForm(false);
    if (onReplySuccess) {
      onReplySuccess();
    }
  };

  if (opinion.isBlinded) {
    return (
      <div className="py-6 px-2 text-center text-sm text-muted-foreground">
        신고로 인해 블라인드 처리된 의견입니다.
      </div>
    );
  }

  // Tailwind는 동적 클래스(ml-${n})를 컴파일하지 않으므로 정적 매핑 사용
  const indentClasses: Record<number, string> = {
    0: "",
    1: "ml-8",
    2: "ml-16",
    3: "ml-24",
    4: "ml-32",
  };
  const indentClass = indentClasses[Math.min(depth, 4)] || "";

  return (
    <div
      ref={itemRef}
      id={`opinion-${opinion.id}`}
      className={cn(
        "py-5 px-1 rounded-lg transition-colors duration-500",
        indentClass,
        highlightVisible && "bg-blue-100/50 dark:bg-blue-900/30 animate-pulse"
      )}
    >
      <div className="flex items-start gap-3">
        {isAnonymous ? (
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-sm">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <Link href={`/users/${opinion.user.id}`}>
            <Avatar className="h-9 w-9 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
              <AvatarImage src={opinion.user.image || undefined} />
              <AvatarFallback className="text-sm">{authorName.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        )}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {isAnonymous ? (
              <span className="font-medium text-sm">{authorName}</span>
            ) : (
              <Link href={`/users/${opinion.user.id}`} className="hover:underline flex items-center gap-1.5">
                <span className="font-medium text-sm">{authorName}</span>
                {opinion.user.isBlacklisted && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 text-destructive border-destructive/50">
                    <Ban className="h-2.5 w-2.5 mr-0.5" />
                    차단됨
                  </Badge>
                )}
              </Link>
            )}
            <Badge variant={opinion.side === "A" ? "sideA" : "sideB"} className="text-[11px] px-1.5 py-0">
              {sideLabel}
            </Badge>
            <span className="text-xs text-muted-foreground/70">
              {formatRelativeTime(opinion.createdAt)}
            </span>
          </div>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90">{opinion.body}</p>
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => onReaction(opinion.id, "LIKE")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all",
                userReaction?.type === "LIKE"
                  ? "text-blue-600 bg-blue-50"
                  : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50/50"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="font-medium">{opinion.reactionSummary.likes}</span>
            </button>
            {session?.user && (
              <>
                {hasReplies && onToggleReplies ? (
                  <>
                    <button
                      onClick={handleReplyCountClick}
                      disabled={loadingReplies}
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all",
                        showRepliesExpanded
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {loadingReplies ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : showRepliesExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      <span className="font-medium">답글 {repliesCount}</span>
                    </button>
                    <button
                      onClick={handleReplyClick}
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all",
                        showReplyForm
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="font-medium">답글 작성</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReplyClick}
                    className={cn(
                      "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all",
                      showReplyForm
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="font-medium">답글{showRepliesCount && repliesCount > 0 ? ` ${repliesCount}` : ""}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {currentUserId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">더보기</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <DropdownMenuItem
                  onClick={handleToggleAnonymity}
                  disabled={isUpdating}
                  className="cursor-pointer"
                >
                  {isAnonymous ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      공개로 전환
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      익명으로 전환
                    </>
                  )}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => setIsReportDialogOpen(true)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  신고하기
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Reply Form */}
      {showReplyForm && (
        <ReplyForm
          parentId={opinion.id}
          topicId={opinion.topicId || ""}
          onSuccess={handleReplySubmitSuccess}
          onCancel={() => setShowReplyForm(false)}
          userVoteSide={userVoteSide}
          optionA={optionA}
          optionB={optionB}
        />
      )}

      <ReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        targetId={opinion.id}
        targetType="opinion"
        onReportSuccess={onReportSuccess}
      />
    </div>
  );
});
