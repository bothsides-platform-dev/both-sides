"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BattleHpBarProps {
  current: number;
  max: number;
  label: string;
  className?: string;
}

export function BattleHpBar({ current, max, label, className }: BattleHpBarProps) {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;

  const colorClass =
    percentage > 60
      ? "[&>div]:bg-green-500"
      : percentage > 30
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-red-500";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="font-medium truncate">{label}</span>
        <span className="text-muted-foreground whitespace-nowrap ml-2">
          {current}/{max} HP
        </span>
      </div>
      <Progress value={percentage} className={cn("h-3", colorClass)} />
    </div>
  );
}
