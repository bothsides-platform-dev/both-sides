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
    <div className="relative flex border-b mb-4">
      {/* Tab buttons */}
      <button
        onClick={() => onTabChange("A")}
        className={cn(
          "flex-1 py-3 text-sm font-medium transition-colors relative",
          activeTab === "A" ? "text-blue-600" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {optionA}
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full",
              activeTab === "A"
                ? "bg-blue-100 text-blue-600"
                : "bg-muted text-muted-foreground"
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
          activeTab === "B" ? "text-red-600" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {optionB}
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full",
              activeTab === "B"
                ? "bg-red-100 text-red-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            {countB}
          </span>
        </span>
      </button>

      {/* Animated indicator */}
      <motion.div
        className={cn(
          "absolute bottom-0 h-0.5 w-1/2",
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
