"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CATEGORY_META, CATEGORY_COLORS } from "@/lib/constants";
import type { Category } from "@prisma/client";

const categories = Object.keys(CATEGORY_META) as Category[];

interface CategoryChipsProps {
  value: Category | undefined;
  onChange: (category: Category | undefined) => void;
  showAll?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryChips({
  value,
  onChange,
  showAll = true,
  size = "md",
  className,
}: CategoryChipsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFadeRight, setShowFadeRight] = useState(false);
  const [showFadeLeft, setShowFadeLeft] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowFadeLeft(scrollLeft > 4);
    setShowFadeRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const chipBase = cn(
    "shrink-0 inline-flex items-center gap-1.5 rounded-full font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
  );

  return (
    <div className={cn("relative", className)}>
      {/* Left fade */}
      {showFadeLeft && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        role="toolbar"
        aria-label="카테고리 필터"
      >
        {showAll && (
          <button
            onClick={() => onChange(undefined)}
            className={cn(
              chipBase,
              !value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            전체
          </button>
        )}
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const isActive = value === cat;
          const Icon = meta.icon;
          const hexColor = isDark ? CATEGORY_COLORS[cat].dark : CATEGORY_COLORS[cat].light;

          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={cn(
                chipBase,
                !isActive && "bg-muted text-muted-foreground hover:bg-accent"
              )}
              style={isActive ? { backgroundColor: hexColor, color: "#fff" } : undefined}
            >
              <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Right fade */}
      {showFadeRight && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  );
}
