"use client";

import { memo } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Side } from "@prisma/client";
import type { Opinion } from "./types";

interface TopicOption {
  id: string;
  label: string;
  displayOrder: number;
}

interface MobileSideTabsProps {
  activeTab: Side;
  onTabChange: (tab: Side) => void;
  optionA: string;
  optionB: string;
  countA: number;
  countB: number;
  // MULTIPLE support
  multipleOptions?: TopicOption[];
  opinionsByOption?: Record<string, Opinion[]>;
}

export const MobileSideTabs = memo(function MobileSideTabs({
  activeTab,
  onTabChange,
  optionA,
  optionB,
  countA,
  countB,
  multipleOptions,
  opinionsByOption,
}: MobileSideTabsProps) {
  // For MULTIPLE topics with many options, use scrollable tabs
  if (multipleOptions && multipleOptions.length > 0) {
    return (
      <div className="relative border-b border-border/50 mb-2 overflow-x-auto scrollbar-thin" role="tablist" aria-label="의견 탭">
        <div className="flex min-w-max">
          {multipleOptions.map((opt, index) => {
            // Map first option to "A" tab, second to "B" tab for activeTab compat
            const tabValue = index === 0 ? "A" : "B";
            const isActive = activeTab === tabValue && index < 2;
            const count = opinionsByOption?.[opt.id]?.length ?? 0;

            return (
              <button
                key={opt.id}
                onClick={() => onTabChange(index === 0 ? "A" : "B")}
                className={cn(
                  "flex-shrink-0 min-h-[44px] px-4 py-3 text-sm font-medium transition-colors relative",
                  isActive ? "text-foreground" : "text-muted-foreground/80"
                )}
                role="tab"
                aria-selected={isActive}
              >
                <span className="flex items-center gap-2">
                  {opt.label}
                  <span className="text-xs tabular-nums text-muted-foreground/70">
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default BINARY tabs
  return (
    <div className="relative flex border-b border-border/50 mb-2" role="tablist" aria-label="의견 탭">
      {/* Tab buttons */}
      <button
        onClick={() => onTabChange("A")}
        className={cn(
          "flex-1 min-h-[44px] py-3 md:py-2 text-sm font-medium transition-colors relative",
          activeTab === "A" ? "text-foreground" : "text-muted-foreground/80"
        )}
        role="tab"
        aria-selected={activeTab === "A"}
      >
        <span className="flex items-center justify-center gap-2">
          {optionA}
          <span
            className={cn(
              "text-xs tabular-nums",
              activeTab === "A"
                ? "text-sideA"
                : "text-muted-foreground/70"
            )}
          >
            {countA}
          </span>
        </span>
      </button>

      <button
        onClick={() => onTabChange("B")}
        className={cn(
          "flex-1 min-h-[44px] py-3 md:py-2 text-sm font-medium transition-colors relative",
          activeTab === "B" ? "text-foreground" : "text-muted-foreground/80"
        )}
        role="tab"
        aria-selected={activeTab === "B"}
      >
        <span className="flex items-center justify-center gap-2">
          {optionB}
          <span
            className={cn(
              "text-xs tabular-nums",
              activeTab === "B"
                ? "text-sideB"
                : "text-muted-foreground/70"
            )}
          >
            {countB}
          </span>
        </span>
      </button>

      {/* Animated indicator */}
      <LazyMotion features={domAnimation}>
        <m.div
          className={cn(
            "absolute bottom-0 h-[2px] w-1/2",
            activeTab === "A" ? "bg-sideA" : "bg-sideB"
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
      </LazyMotion>
    </div>
  );
});
