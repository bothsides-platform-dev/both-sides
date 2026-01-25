"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Eye, EyeOff, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import type { Opinion } from "./types";
import type { ReactionType } from "@prisma/client";

interface OpinionItemProps {
  opinion: Opinion;
  optionA: string;
  optionB: string;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
  showSideBorder?: boolean;
}

export const OpinionItem = memo(function OpinionItem({
  opinion,
  optionA,
  optionB,
  currentUserId,
  onReaction,
}: OpinionItemProps) {
  const [isAnonymous, setIsAnonymous] = useState(opinion.isAnonymous ?? false);
  const [isUpdating, setIsUpdating] = useState(false);

  const authorName = isAnonymous 
    ? "익명" 
    : (opinion.user.nickname || opinion.user.name || "익명");
  const sideLabel = opinion.side === "A" ? optionA : optionB;
  const isOwner = currentUserId === opinion.user.id;

  // Check if current user has reacted
  const userReaction = opinion.reactions.find((r) => r.userId === currentUserId);

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

  if (opinion.isBlinded) {
    return (
      <div className="py-6 px-2 text-center text-sm text-muted-foreground">
        신고로 인해 블라인드 처리된 의견입니다.
      </div>
    );
  }

  return (
    <div className="py-5 px-1">
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
              <Link href={`/users/${opinion.user.id}`} className="hover:underline">
                <span className="font-medium text-sm">{authorName}</span>
              </Link>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px]"
                onClick={handleToggleAnonymity}
                disabled={isUpdating}
              >
                {isAnonymous ? (
                  <>
                    <EyeOff className="h-2.5 w-2.5 mr-0.5" />
                    익명
                  </>
                ) : (
                  <>
                    <Eye className="h-2.5 w-2.5 mr-0.5" />
                    공개
                  </>
                )}
              </Button>
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
            <button
              onClick={() => onReaction(opinion.id, "DISLIKE")}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all",
                userReaction?.type === "DISLIKE"
                  ? "text-red-600 bg-red-50"
                  : "text-muted-foreground hover:text-red-600 hover:bg-red-50/50"
              )}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="font-medium">{opinion.reactionSummary.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
