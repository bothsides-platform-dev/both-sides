"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BattleMessageRole } from "@prisma/client";
import type { GroundAction } from "@/modules/battles/types";

type MessageMetadata = {
  action?: GroundAction;
  targetGroundId?: string | null;
  reinforcedGroundId?: string | null;
  // Legacy fields for backward compatibility
  validity?: "valid" | "invalid" | "ambiguous";
};

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
  metadata: MessageMetadata | null;
  createdAt: string;
}

const ACTION_BADGES: Record<GroundAction, { label: string; className: string }> = {
  new_ground: {
    label: "NEW",
    className: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  },
  reinforce: {
    label: "REINFORCE",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  },
  counter: {
    label: "COUNTER",
    className: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
  redundant: {
    label: "REDUNDANT",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  },
  invalid: {
    label: "INVALID",
    className: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  },
};

export function BattleMessageItem({
  role,
  content,
  user,
  hpChange,
  metadata,
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

  // Determine action badge from metadata
  const action = metadata?.action;
  const badge = action ? ACTION_BADGES[action] : null;

  // Affected ground info
  let affectedInfo: string | null = null;
  if (action === "counter" && metadata?.targetGroundId) {
    affectedInfo = `${metadata.targetGroundId} 반박됨`;
  } else if (action === "reinforce" && metadata?.reinforcedGroundId) {
    affectedInfo = `${metadata.reinforcedGroundId} 보강됨`;
  }

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
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {badge && (
            <span
              className={cn(
                "inline-block text-[10px] font-bold px-1.5 py-0.5 rounded",
                badge.className
              )}
            >
              {badge.label}
            </span>
          )}
          {affectedInfo && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {affectedInfo}
            </span>
          )}
          {hpChange !== null && hpChange !== 0 && (
            <span
              className={cn(
                "inline-block text-xs font-medium px-1.5 py-0.5 rounded",
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
    </div>
  );
}
