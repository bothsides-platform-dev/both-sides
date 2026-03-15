"use client";

import Link from "next/link";
import { Swords, Trophy, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeBlockBattle {
  id: string;
  status: string;
  battleTitle: string | null;
  customOptionA: string | null;
  customOptionB: string | null;
  challengerSide: string;
  challengedSide: string;
  challengerHp: number | null;
  challengedHp: number | null;
  durationSeconds: number | null;
  endReason: string | null;
  winnerId: string | null;
  challenger: { id: string; nickname: string | null; name: string | null };
  challenged: { id: string; nickname: string | null; name: string | null };
  winner?: { nickname: string | null; name: string | null } | null;
}

interface ChallengeBlockCommentProps {
  battle: ChallengeBlockBattle;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "대기중", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" },
  SETUP: { label: "설정중", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
  ACTIVE: { label: "진행중", className: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 animate-pulse" },
  COMPLETED: { label: "완료", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  RESIGNED: { label: "기권", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  DECLINED: { label: "거절됨", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500" },
  EXPIRED: { label: "만료됨", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500" },
};

export function ChallengeBlockComment({ battle }: ChallengeBlockCommentProps) {
  const challengerName = battle.challenger.nickname || battle.challenger.name || "도전자";
  const challengedName = battle.challenged.nickname || battle.challenged.name || "상대";
  const statusInfo = STATUS_CONFIG[battle.status] ?? STATUS_CONFIG.PENDING;
  const isActive = battle.status === "ACTIVE";
  const isCompleted = ["COMPLETED", "RESIGNED"].includes(battle.status);
  const isInactive = ["DECLINED", "EXPIRED", "ABANDONED"].includes(battle.status);

  return (
    <Link href={`/battles/${battle.id}`} className="block">
      <div
        className={cn(
          "border-2 rounded-xl p-4 transition-all cursor-pointer",
          isInactive
            ? "border-gray-200 bg-gray-50/60 dark:border-gray-700 dark:bg-gray-900/40 opacity-70 hover:opacity-90"
            : isActive
              ? "border-orange-300 bg-gradient-to-br from-orange-50/80 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/10 dark:border-orange-700 hover:shadow-md"
              : "border-orange-200/60 bg-gradient-to-br from-orange-50/40 to-amber-50/30 dark:from-orange-950/10 dark:to-amber-950/5 dark:border-orange-800/40 hover:shadow-md"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className={cn("h-4 w-4", isInactive ? "text-gray-400" : "text-orange-500")} />
            <span className={cn("text-sm font-bold", isInactive ? "text-gray-400 dark:text-gray-500" : "text-orange-600 dark:text-orange-400")}>
              맞짱 도전
            </span>
          </div>
          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", statusInfo.className)}>
            {isActive && <Loader2 className="inline h-3 w-3 mr-0.5 animate-spin" />}
            {statusInfo.label}
          </span>
        </div>

        {/* Battle Title */}
        {battle.battleTitle && (
          <p className={cn("text-sm font-semibold mb-3", isInactive ? "text-gray-400 line-through" : "text-foreground")}>
            {battle.battleTitle}
          </p>
        )}

        {/* Sides */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-2">
          <div className="text-center space-y-0.5">
            <div className={cn("text-xs truncate", isInactive ? "text-gray-400" : "text-muted-foreground")}>{challengerName}</div>
            <span className={cn(
              "inline-block text-xs font-bold px-2 py-0.5 rounded",
              isInactive ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500" : "bg-sideA/15 text-sideA"
            )}>
              {battle.customOptionA}
            </span>
          </div>
          <div className={cn("text-sm font-bold", isInactive ? "text-gray-300 dark:text-gray-600" : "text-muted-foreground")}>VS</div>
          <div className="text-center space-y-0.5">
            <div className={cn("text-xs truncate", isInactive ? "text-gray-400" : "text-muted-foreground")}>{challengedName}</div>
            <span className={cn(
              "inline-block text-xs font-bold px-2 py-0.5 rounded",
              isInactive ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500" : "bg-sideB/15 text-sideB"
            )}>
              {battle.customOptionB}
            </span>
          </div>
        </div>

        {/* Duration */}
        {battle.durationSeconds && !isCompleted && (
          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            <span>{Math.floor(battle.durationSeconds / 60)}분</span>
          </div>
        )}

        {/* Winner */}
        {isCompleted && battle.winner && (
          <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-medium">
              {battle.winner.nickname || battle.winner.name} 승리
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
