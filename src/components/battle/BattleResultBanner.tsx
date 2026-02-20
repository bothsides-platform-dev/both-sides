"use client";

import { Trophy, Flag, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface BattleResultBannerProps {
  winnerId: string | null;
  currentUserId?: string;
  winnerName: string;
  endReason: string | null;
}

export function BattleResultBanner({
  winnerId,
  currentUserId,
  winnerName,
  endReason,
}: BattleResultBannerProps) {
  const isAdminForceEnded = endReason === "admin_force_ended";
  const isWinner = winnerId === currentUserId;
  const isParticipant = !!currentUserId;

  const reasonLabel =
    endReason === "admin_force_ended"
      ? "관리자 종료"
      : endReason === "hp_zero"
        ? "HP 소진"
        : endReason === "resigned"
          ? "기권"
          : endReason === "abandoned"
            ? "시간 초과"
            : "배틀 종료";

  const Icon =
    endReason === "admin_force_ended"
      ? ShieldAlert
      : endReason === "resigned"
        ? Flag
        : endReason === "abandoned"
          ? Clock
          : Trophy;

  if (isAdminForceEnded) {
    return (
      <div className="rounded-lg p-4 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
        <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-lg">관리자에 의해 종료되었습니다</h3>
        <p className="text-sm text-muted-foreground mt-1">{reasonLabel}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg p-4 text-center",
        isParticipant && isWinner
          ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
          : isParticipant && !isWinner
            ? "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800"
            : "bg-muted/50 border"
      )}
    >
      <Icon
        className={cn(
          "h-8 w-8 mx-auto mb-2",
          isParticipant && isWinner
            ? "text-yellow-500"
            : "text-muted-foreground"
        )}
      />
      <h3 className="font-bold text-lg">
        {isParticipant
          ? isWinner
            ? "승리!"
            : "패배"
          : `${winnerName} 승리!`}
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{reasonLabel}</p>
    </div>
  );
}
