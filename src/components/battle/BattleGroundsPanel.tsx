"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GroundsRegistry, Ground } from "@/modules/battles/types";

interface BattleGroundsPanelProps {
  registry: GroundsRegistry | null;
  optionA: string;
  optionB: string;
  counteredGroundId: string | null;
}

function GroundCard({
  ground,
  isAnimatingCounter,
}: {
  ground: Ground;
  isAnimatingCounter: boolean;
}) {
  const isCountered = ground.status === "countered";
  const isSideA = ground.side === "A";

  return (
    <div
      className={cn(
        "rounded-lg border p-2 text-xs transition-all duration-300",
        isCountered && "opacity-50",
        isAnimatingCounter && "animate-shake",
        isSideA
          ? "border-sideA/30 bg-sideA/5"
          : "border-sideB/30 bg-sideB/5"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "font-mono text-[10px] font-bold shrink-0",
            isSideA ? "text-sideA" : "text-sideB"
          )}
        >
          {ground.id}
        </span>
        <div className="flex items-center gap-1">
          {ground.reinforcedCount > 0 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 font-medium">
              +{ground.reinforcedCount}
            </span>
          )}
          {isCountered && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 font-medium">
              X
            </span>
          )}
        </div>
      </div>
      <p
        className={cn(
          "mt-1 leading-tight",
          isCountered && "line-through text-muted-foreground"
        )}
      >
        {ground.summary}
      </p>
      {isCountered && ground.counteredBy && (
        <p className="mt-0.5 text-[10px] text-red-500">
          반박됨
        </p>
      )}
    </div>
  );
}

export function BattleGroundsPanel({
  registry,
  optionA,
  optionB,
  counteredGroundId,
}: BattleGroundsPanelProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    if (counteredGroundId) {
      setAnimatingId(counteredGroundId);
      const timer = setTimeout(() => setAnimatingId(null), 600);
      return () => clearTimeout(timer);
    }
  }, [counteredGroundId]);

  if (!registry) return null;

  const hasGrounds = registry.A.length > 0 || registry.B.length > 0;
  if (!hasGrounds) return null;

  return (
    <div className="border rounded-lg p-3">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">
        근거 현황
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Side A */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-sideA truncate">
            {optionA}
          </div>
          {registry.A.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">
              아직 근거 없음
            </p>
          ) : (
            registry.A.map((g) => (
              <GroundCard
                key={g.id}
                ground={g}
                isAnimatingCounter={animatingId === g.id}
              />
            ))
          )}
        </div>

        {/* Side B */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-sideB truncate">
            {optionB}
          </div>
          {registry.B.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">
              아직 근거 없음
            </p>
          ) : (
            registry.B.map((g) => (
              <GroundCard
                key={g.id}
                ground={g}
                isAnimatingCounter={animatingId === g.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
