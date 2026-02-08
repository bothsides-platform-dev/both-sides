"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface HorizontalScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showArrows?: boolean;
}

export function HorizontalScroll({
  children,
  showArrows = true,
  className,
  ...props
}: HorizontalScrollProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScrollability = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, []);

  React.useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability, { passive: true });

    return () => {
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability]);

  React.useEffect(() => {
    // Re-check after children mount
    const timer = setTimeout(checkScrollability, 100);
    return () => clearTimeout(timer);
  }, [children, checkScrollability]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative group", className)} {...props}>
      {showArrows && canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background shadow-md md:opacity-0 transition-opacity md:group-hover:opacity-100"
          onClick={() => scroll("left")}
          aria-label="이전으로 스크롤"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2 pr-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {showArrows && canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-background shadow-md md:opacity-0 transition-opacity md:group-hover:opacity-100"
          onClick={() => scroll("right")}
          aria-label="다음으로 스크롤"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Fade edges for visual indication */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent" />
      )}
    </div>
  );
}

interface HorizontalScrollItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HorizontalScrollItem({
  children,
  className,
  ...props
}: HorizontalScrollItemProps) {
  return (
    <div className={cn("flex-shrink-0", className)} {...props}>
      {children}
    </div>
  );
}
