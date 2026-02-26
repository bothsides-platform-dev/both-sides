"use client";

import Link from "next/link";
import { Swords, Trophy } from "lucide-react";
import { BattleHpBar } from "./BattleHpBar";
import { cn } from "@/lib/utils";

interface BattleCardProps {
  battle: {
    id: string;
    status: string;
    challengerHp: number | null;
    challengedHp: number | null;
    durationSeconds: number | null;
    challenger: {
      nickname: string | null;
      name: string | null;
    };
    challenged: {
      nickname: string | null;
      name: string | null;
    };
    challengerSide: string;
    challengedSide: string;
    topic: {
      title?: string;
      optionA: string;
      optionB: string;
    };
    winner?: { nickname: string | null; name: string | null } | null;
    endReason?: string | null;
  };
  showTopicTitle?: boolean;
}

const END_REASON_LABELS: Record<string, string> = {
  hp_zero: "HP 소진",
  timeout: "시간 초과",
  resigned: "기권",
  admin_force_ended: "관리자 종료",
};

export function BattleCard({ battle, showTopicTitle }: BattleCardProps) {
  const maxHp = battle.durationSeconds ?? 600;
  const challengerName = battle.challenger.nickname || battle.challenger.name || "도전자";
  const challengedName = battle.challenged.nickname || battle.challenged.name || "상대";
  const isActive = battle.status === "ACTIVE";

  return (
    <Link href={`/battles/${battle.id}`}>
      <div
        className={cn(
          "border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer",
          isActive && "border-orange-200 dark:border-orange-800 bg-orange-50/30 dark:bg-orange-950/10"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Swords className="h-4 w-4 text-orange-500" />
            <span className="text-orange-600 dark:text-orange-400">맞짱</span>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 animate-pulse">
                LIVE
              </span>
            )}
          </div>
        </div>

        {showTopicTitle && battle.topic.title && (
          <p className="text-xs text-muted-foreground truncate mb-1">{battle.topic.title}</p>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="text-sm font-medium truncate text-right">
            {challengerName}
            <span className="text-xs text-muted-foreground ml-1">
              ({battle.challengerSide === "A" ? battle.topic.optionA : battle.topic.optionB})
            </span>
          </div>
          <span className="text-xs font-bold text-muted-foreground">VS</span>
          <div className="text-sm font-medium truncate">
            {challengedName}
            <span className="text-xs text-muted-foreground ml-1">
              ({battle.challengedSide === "A" ? battle.topic.optionA : battle.topic.optionB})
            </span>
          </div>
        </div>

        {isActive && battle.challengerHp !== null && battle.challengedHp !== null && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <BattleHpBar
              current={battle.challengerHp}
              max={maxHp}
              label={challengerName}
            />
            <BattleHpBar
              current={battle.challengedHp}
              max={maxHp}
              label={challengedName}
            />
          </div>
        )}

        {battle.status === "COMPLETED" && battle.winner && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-medium">{battle.winner.nickname || battle.winner.name}</span>
            {battle.endReason && (
              <span className="text-muted-foreground">· {END_REASON_LABELS[battle.endReason] ?? battle.endReason}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
