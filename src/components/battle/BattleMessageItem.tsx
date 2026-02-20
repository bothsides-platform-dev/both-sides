"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BattleMessageRole } from "@prisma/client";

interface BattleMessageItemProps {
  role: BattleMessageRole;
  content: string;
  user: {
    nickname: string | null;
    name: string | null;
    image: string | null;
  } | null;
  hpChange: number | null;
  targetUserId: string | null;
  createdAt: string;
}

export function BattleMessageItem({
  role,
  content,
  user,
  hpChange,
  createdAt,
}: BattleMessageItemProps) {
  const isHost = role === "HOST";
  const isSystem = role === "SYSTEM";
  const displayName =
    isHost
      ? "호스트"
      : isSystem
        ? "시스템"
        : user?.nickname || user?.name || "참가자";

  return (
    <div
      className={cn(
        "flex gap-2 py-2",
        (isHost || isSystem) && "px-3 rounded-lg",
        isHost && "bg-amber-50/50 dark:bg-amber-950/20",
        isSystem && "bg-muted/50"
      )}
    >
      {!isHost && !isSystem && user && (
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback className="text-xs">
            {(user.nickname || user.name || "?")[0]}
          </AvatarFallback>
        </Avatar>
      )}

      {(isHost || isSystem) && (
        <div className="h-7 w-7 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-sm">
          {isHost ? "🎙️" : "⚙️"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              isHost && "text-amber-700 dark:text-amber-400",
              isSystem && "text-muted-foreground",
              !isHost && !isSystem && "text-foreground"
            )}
          >
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
            {new Date(createdAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap mt-0.5">{content}</p>
        {hpChange !== null && hpChange !== 0 && (
          <span
            className={cn(
              "inline-block text-xs font-medium mt-1 px-1.5 py-0.5 rounded",
              hpChange < 0
                ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
            )}
          >
            {hpChange > 0 ? "+" : ""}{hpChange} HP
          </span>
        )}
      </div>
    </div>
  );
}
