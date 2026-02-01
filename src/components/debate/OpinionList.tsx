"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import { OpinionThread } from "./OpinionThread";
import type { Opinion } from "./types";
import type { ReactionType, Side } from "@prisma/client";

interface OpinionListProps {
  opinions: Opinion[];
  optionA: string;
  optionB: string;
  isLoading?: boolean;
  emptyMessage?: string;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
  onReportSuccess?: () => void;
  onReplySuccess?: () => void;
  userVoteSide?: Side;
  highlightReplyId?: string;
  expandedAncestorIds?: string[];
}

export const OpinionList = memo(function OpinionList({
  opinions,
  optionA,
  optionB,
  isLoading = false,
  emptyMessage = "아직 의견이 없습니다.",
  currentUserId,
  onReaction,
  onReplySuccess,
  highlightReplyId,
  expandedAncestorIds,
}: OpinionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (opinions.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground/70">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {opinions.map((opinion) => (
        <OpinionThread
          key={opinion.id}
          opinion={opinion}
          optionA={optionA}
          optionB={optionB}
          currentUserId={currentUserId}
          onReaction={onReaction}
          onReplySuccess={onReplySuccess}
          highlightReplyId={highlightReplyId}
          expandedAncestorIds={expandedAncestorIds}
        />
      ))}
    </div>
  );
});
