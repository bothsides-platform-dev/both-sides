"use client";

import { memo, useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTruncationDetection } from "@/hooks/useTruncationDetection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarWithSkin } from "@/components/ui/AvatarWithSkin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThumbsUp, Eye, EyeOff, User, UserRound, MoreVertical, Flag, MessageCircle, ChevronDown, ChevronUp, Loader2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime, getGuestLabel, getAnonymousLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { ReportDialog } from "./ReportDialog";
import { ReplyForm } from "./ReplyForm";
import { BattleChallengeButton } from "@/components/battle/BattleChallengeButton";
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
  allVisibleOpinions?: Opinion[];
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
  allVisibleOpinions = [],
}: OpinionItemProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(opinion.isAnonymous ?? false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [highlightVisible, setHighlightVisible] = useState(isHighlighted);
  const [isExpanded, setIsExpanded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const { textRef, showButton } = useTruncationDetection(opinion.id, isExpanded);

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

  const isGuest = !opinion.user;
  
  // Generate guest label using the utility function
  const guestLabel = useMemo(() => {
    return isGuest ? getGuestLabel(opinion.visitorId, allVisibleOpinions) : "";
  }, [isGuest, opinion.visitorId, allVisibleOpinions]);

  // Generate anonymous label for logged-in users who post anonymously
  const anonymousLabel = useMemo(() => {
    return (!isGuest && isAnonymous) ? getAnonymousLabel(opinion.user?.id, allVisibleOpinions) : "";
  }, [isGuest, isAnonymous, opinion.user?.id, allVisibleOpinions]);
  
  const authorName = isGuest
    ? guestLabel
    : isAnonymous 
      ? anonymousLabel 
      : (opinion.user!.nickname || opinion.user!.name || "익명");
  const sideLabel = opinion.side === "A" ? optionA : optionB;
  const isOwner = !isGuest && currentUserId === opinion.user?.id;

  // Check if current user has reacted
  const userReaction = opinion.reactions?.find((r) => r.userId === currentUserId);

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
      showToast(error instanceof Error ? error.message : "익명 상태 변경에 실패했습니다.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReplyClick = () => {
    if (!session?.user && !userVoteSide) {
      showToast("투표를 먼저 해주세요.", "error");
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
      <div className="py-4 px-2 text-center text-sm text-muted-foreground">
        신고로 인해 블라인드 처리된 의견입니다.
      </div>
    );
  }

  // Tailwind는 동적 클래스(ml-${n})를 컴파일하지 않으므로 정적 매핑 사용
  const indentClasses: Record<number, string> = {
    0: "",
    1: "ml-3 md:ml-8",
    2: "ml-6 md:ml-16",
    3: "ml-6 md:ml-24",
    4: "ml-6 md:ml-32",
  };
  const indentClass = indentClasses[Math.min(depth, 4)] || "";

  // Visual depth indicator for mobile
  const depthIndicatorClass = depth > 0
    ? "border-l-2 border-muted-foreground/20 pl-2 md:border-l-0 md:pl-0"
    : "";

  return (
    <div
      ref={itemRef}
      id={`opinion-${opinion.id}`}
      className={cn(
        "py-3 px-1 md:py-2 rounded-lg transition-colors duration-500",
        indentClass,
        depthIndicatorClass,
        highlightVisible && "bg-blue-100/50 dark:bg-blue-900/30 animate-pulse"
      )}
    >
      <div className="flex items-start gap-3">
        {isGuest ? (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              <UserRound className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : isAnonymous ? (
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        ) : (
          <AvatarWithSkin
            src={opinion.user!.image}
            fallback={authorName.charAt(0)}
            selectedBadgeId={opinion.user!.selectedBadgeId}
            size="sm"
            linkHref={`/users/${opinion.user!.id}`}
          />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isGuest ? (
              <span className="font-medium text-sm text-muted-foreground">{authorName}</span>
            ) : isAnonymous ? (
              <span className="font-medium text-sm">{authorName}</span>
            ) : (
              <Link href={`/users/${opinion.user!.id}`} className="hover:underline flex items-center gap-1.5">
                <span className="font-medium text-sm">{authorName}</span>
                {opinion.user!.isBlacklisted && (
                  <Badge variant="outline" className="text-2xs px-1 py-0 text-destructive border-destructive/50">
                    <Ban className="h-2.5 w-2.5 mr-0.5" />
                    차단됨
                  </Badge>
                )}
              </Link>
            )}
            <Badge variant={opinion.side === "A" ? "sideA" : "sideB"} className="text-xs px-1.5 py-0">
              {sideLabel}
            </Badge>
            <span className="text-xs text-muted-foreground/80" suppressHydrationWarning>
              {formatRelativeTime(opinion.createdAt)}
            </span>
          </div>
          <div>
            <p
              ref={textRef}
              className={cn(
                "text-sm leading-relaxed whitespace-pre-wrap text-foreground/90",
                !isExpanded && "line-clamp-3"
              )}
            >
              {opinion.body}
            </p>
            {showButton && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary hover:underline mt-1"
                aria-label={isExpanded ? "의견 접기" : "의견 더보기"}
              >
                {isExpanded ? "접기" : "더보기"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onReaction(opinion.id, "LIKE")}
              className={cn(
                "flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-all",
                "md:min-h-[36px] md:min-w-[36px] md:px-1.5 md:py-0.5 md:rounded",
                userReaction?.type === "LIKE"
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                  : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
              )}
              aria-label={`좋아요 ${opinion.reactionSummary.likes}개`}
            >
              <ThumbsUp className="h-4 w-4 md:h-3 md:w-3" />
              <span className="font-medium">{opinion.reactionSummary.likes}</span>
            </button>
            {opinion.user?.id && session?.user && (
              <BattleChallengeButton
                opinionId={opinion.id}
                opinionUserId={opinion.user.id}
                topicId={opinion.topicId || ""}
                currentUserId={currentUserId}
              />
            )}
            {(session?.user || userVoteSide) && (
              <>
                {hasReplies && onToggleReplies ? (
                  <>
                    <button
                      onClick={handleReplyCountClick}
                      disabled={loadingReplies}
                      className={cn(
                        "flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-all",
                        "md:min-h-[36px] md:min-w-[36px] md:px-1.5 md:py-0.5 md:rounded",
                        showRepliesExpanded
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                      aria-label={`답글 ${repliesCount}개 ${showRepliesExpanded ? "접기" : "펼치기"}`}
                    >
                      {loadingReplies ? (
                        <Loader2 className="h-4 w-4 md:h-3 md:w-3 animate-spin" />
                      ) : showRepliesExpanded ? (
                        <ChevronUp className="h-4 w-4 md:h-3 md:w-3" />
                      ) : (
                        <ChevronDown className="h-4 w-4 md:h-3 md:w-3" />
                      )}
                      <span className="font-medium">답글 {repliesCount}</span>
                    </button>
                    <button
                      onClick={handleReplyClick}
                      className={cn(
                        "flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-all",
                        "md:min-h-[36px] md:min-w-[36px] md:px-1.5 md:py-0.5 md:rounded",
                        showReplyForm
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                      aria-label="답글 작성"
                    >
                      <MessageCircle className="h-4 w-4 md:h-3 md:w-3" />
                      <span className="font-medium">답글 작성</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReplyClick}
                    className={cn(
                      "flex items-center gap-1.5 text-xs min-h-[44px] min-w-[44px] px-2 py-2 rounded-lg transition-all",
                      "md:min-h-[36px] md:min-w-[36px] md:px-1.5 md:py-0.5 md:rounded",
                      showReplyForm
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    aria-label={`답글${showRepliesCount && repliesCount > 0 ? ` ${repliesCount}개` : ""}`}
                  >
                    <MessageCircle className="h-4 w-4 md:h-3 md:w-3" />
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
                className="min-h-[44px] min-w-[44px] md:h-8 md:w-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label="의견 메뉴 열기"
              >
                <MoreVertical className="h-5 w-5 md:h-4 md:w-4" />
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
