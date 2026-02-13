"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
  userVoteSide,
  highlightReplyId,
  expandedAncestorIds,
}: OpinionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (opinions.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground/80">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {opinions.map((opinion) => (
        <div
          key={opinion.id}
          style={{ contentVisibility: "auto", containIntrinsicSize: "auto 120px" }}
        >
          <OpinionThread
            opinion={opinion}
            optionA={optionA}
            optionB={optionB}
            currentUserId={currentUserId}
            onReaction={onReaction}
            onReplySuccess={onReplySuccess}
            userVoteSide={userVoteSide}
            highlightReplyId={highlightReplyId}
            expandedAncestorIds={expandedAncestorIds}
          />
        </div>
      ))}
    </div>
  );
});
