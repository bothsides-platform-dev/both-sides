"use client";

import { Swords } from "lucide-react";

interface BattleProfileStatsProps {
  wins: number;
  losses: number;
}

export function BattleProfileStats({ wins, losses }: BattleProfileStatsProps) {
  if (wins === 0 && losses === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Swords className="h-4 w-4 text-orange-500" />
      <span className="font-medium">
        {wins}승 {losses}패
      </span>
    </div>
  );
}
