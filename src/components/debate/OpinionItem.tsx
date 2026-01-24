"use client";

import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";
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
  showSideBorder = true,
}: OpinionItemProps) {
  const authorName = opinion.user.nickname || opinion.user.name || "익명";
  const sideLabel = opinion.side === "A" ? optionA : optionB;

  // Check if current user has reacted
  const userReaction = opinion.reactions.find((r) => r.userId === currentUserId);

  if (opinion.isBlinded) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        신고로 인해 블라인드 처리된 의견입니다.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        showSideBorder && (opinion.side === "A" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-red-500")
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={opinion.user.image || undefined} />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{authorName}</span>
            <Badge variant={opinion.side === "A" ? "sideA" : "sideB"} className="text-xs">
              {sideLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(opinion.createdAt)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{opinion.body}</p>
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => onReaction(opinion.id, "LIKE")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                userReaction?.type === "LIKE"
                  ? "text-blue-600"
                  : "text-muted-foreground hover:text-blue-600"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{opinion.reactionSummary.likes}</span>
            </button>
            <button
              onClick={() => onReaction(opinion.id, "DISLIKE")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                userReaction?.type === "DISLIKE"
                  ? "text-red-600"
                  : "text-muted-foreground hover:text-red-600"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{opinion.reactionSummary.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
