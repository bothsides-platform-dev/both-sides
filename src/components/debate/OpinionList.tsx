"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import { OpinionItem } from "./OpinionItem";
import type { Opinion } from "./types";
import type { ReactionType } from "@prisma/client";

interface OpinionListProps {
  opinions: Opinion[];
  optionA: string;
  optionB: string;
  isLoading?: boolean;
  emptyMessage?: string;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
}

export const OpinionList = memo(function OpinionList({
  opinions,
  optionA,
  optionB,
  isLoading = false,
  emptyMessage = "아직 의견이 없습니다.",
  currentUserId,
  onReaction,
}: OpinionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (opinions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {opinions.map((opinion) => (
        <OpinionItem
          key={opinion.id}
          opinion={opinion}
          optionA={optionA}
          optionB={optionB}
          currentUserId={currentUserId}
          onReaction={onReaction}
        />
      ))}
    </div>
  );
});
