"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Side } from "@prisma/client";

interface MobileSideTabsProps {
  activeTab: Side;
  onTabChange: (tab: Side) => void;
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
}

export const MobileSideTabs = memo(function MobileSideTabs({
  activeTab,
  onTabChange,
  optionA,
  optionB,
  countA,
  countB,
}: MobileSideTabsProps) {
  return (
    <div className="relative flex border-b border-border/50 mb-3">
      {/* Tab buttons */}
      <button
        onClick={() => onTabChange("A")}
        className={cn(
          "flex-1 py-3 text-sm font-medium transition-colors relative",
          activeTab === "A" ? "text-foreground" : "text-muted-foreground/70"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {optionA}
          <span
            className={cn(
              "text-xs tabular-nums",
              activeTab === "A"
                ? "text-blue-600"
                : "text-muted-foreground/50"
            )}
          >
            {countA}
          </span>
        </span>
      </button>

      <button
        onClick={() => onTabChange("B")}
        className={cn(
          "flex-1 py-3 text-sm font-medium transition-colors relative",
          activeTab === "B" ? "text-foreground" : "text-muted-foreground/70"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {optionB}
          <span
            className={cn(
              "text-xs tabular-nums",
              activeTab === "B"
                ? "text-red-600"
                : "text-muted-foreground/50"
            )}
          >
            {countB}
          </span>
        </span>
      </button>

      {/* Animated indicator */}
      <motion.div
        className={cn(
          "absolute bottom-0 h-[2px] w-1/2",
          activeTab === "A" ? "bg-blue-500" : "bg-red-500"
        )}
        initial={false}
        animate={{
          x: activeTab === "A" ? "0%" : "100%",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    </div>
  );
});
