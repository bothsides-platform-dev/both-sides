"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { OpinionList } from "./OpinionList";
import type { Opinion } from "./types";
import type { Side, ReactionType } from "@prisma/client";

interface OpinionColumnProps {
  side: Side;
  sideLabel: string;
  opinions: Opinion[];
  optionA: string;
  optionB: string;
  isLoading?: boolean;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
  onReportSuccess?: () => void;
  onReplySuccess?: () => void;
  userVoteSide?: Side;
  highlightReplyId?: string;
  expandedAncestorIds?: string[];
}

export const OpinionColumn = memo(function OpinionColumn({
  side,
  sideLabel,
  opinions,
  optionA,
  optionB,
  isLoading = false,
  currentUserId,
  onReaction,
  onReportSuccess,
  onReplySuccess,
  userVoteSide,
  highlightReplyId,
  expandedAncestorIds,
}: OpinionColumnProps) {
  const isA = side === "A";

  return (
    <div className="flex flex-col rounded-xl border border-border/50 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isA ? "bg-sideA" : "bg-sideB"
            )}
          />
          <h3 className="font-medium text-foreground">
            {sideLabel}
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {opinions.length}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <OpinionList
          opinions={opinions}
          optionA={optionA}
          optionB={optionB}
          isLoading={isLoading}
          emptyMessage={`${sideLabel} 측 의견이 없습니다. 첫 번째 의견을 남겨보세요!`}
          currentUserId={currentUserId}
          onReaction={onReaction}
          onReportSuccess={onReportSuccess}
          onReplySuccess={onReplySuccess}
          userVoteSide={userVoteSide}
          highlightReplyId={highlightReplyId}
          expandedAncestorIds={expandedAncestorIds}
        />
      </div>
    </div>
  );
});
