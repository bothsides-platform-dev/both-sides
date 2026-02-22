"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface BattleTimerProps {
  turnStartedAt: string | null;
  isMyTurn: boolean;
  currentHp: number;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function BattleTimer({ turnStartedAt, isMyTurn, currentHp, className }: BattleTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!turnStartedAt || !isMyTurn) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(turnStartedAt).getTime();

    const update = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [turnStartedAt, isMyTurn]);

  const remainingHp = Math.max(0, currentHp - (isMyTurn ? elapsed : 0));

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-mono",
        isMyTurn ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground",
        className
      )}
    >
      <Timer className="h-4 w-4" />
      {isMyTurn ? (
        <span>{formatTime(remainingHp)}</span>
      ) : (
        <span>--:--</span>
      )}
    </div>
  );
}
