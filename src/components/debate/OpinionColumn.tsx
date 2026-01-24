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
}: OpinionColumnProps) {
  const isA = side === "A";

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border",
        isA ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-red-500"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          isA ? "bg-blue-50/50" : "bg-red-50/50"
        )}
      >
        <h3
          className={cn(
            "font-semibold",
            isA ? "text-blue-700" : "text-red-700"
          )}
        >
          {sideLabel}
        </h3>
        <span
          className={cn(
            "inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium rounded-full",
            isA
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {opinions.length}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="max-h-[600px] overflow-y-auto p-4">
        <OpinionList
          opinions={opinions}
          optionA={optionA}
          optionB={optionB}
          isLoading={isLoading}
          emptyMessage={`${sideLabel} 측 의견이 없습니다. 첫 번째 의견을 남겨보세요!`}
          currentUserId={currentUserId}
          onReaction={onReaction}
        />
      </div>
    </div>
  );
});
