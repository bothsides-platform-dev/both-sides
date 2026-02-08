"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { hierarchy, pack } from "d3-hierarchy";
import { useTheme } from "next-themes";
import { fetcher } from "@/lib/fetcher";
import { CATEGORY_META, CATEGORY_COLORS } from "@/lib/constants";
import { Eye, MessageSquare, Users } from "lucide-react";
import type { Category } from "@prisma/client";

interface BubbleTopic {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
  category: Category;
  viewCount: number;
  _count: {
    votes: number;
    opinions: number;
  };
}

interface TopicsResponse {
  data: {
    topics: BubbleTopic[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface BubbleNode {
  r: number;
  topic: BubbleTopic;
  children?: BubbleNode[];
}

interface BubbleData {
  x: number;
  y: number;
  r: number;
  topic: BubbleTopic;
}

const categories = Object.keys(CATEGORY_META) as Category[];

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

function BubblePopoverContent({ topic }: { topic: BubbleTopic }) {
  const meta = CATEGORY_META[topic.category];
  const Icon = meta.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.bgColor} ${meta.color}`}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug">{topic.title}</p>
      <div className="flex gap-2">
        <span className="flex-1 rounded-md bg-blue-50 px-2 py-1.5 text-center text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          A. {topic.optionA}
        </span>
        <span className="flex-1 rounded-md bg-red-50 px-2 py-1.5 text-center text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
          B. {topic.optionB}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {topic._count.votes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {topic._count.opinions}
        </span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {topic.viewCount}
        </span>
      </div>
      <Link
        href={`/topics/${topic.id}`}
        className="block rounded-md bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background transition-opacity hover:opacity-90"
      >
        자세히 보기
      </Link>
    </div>
  );
}

function getPopoverPosition(
  bubble: BubbleData,
  containerWidth: number,
  popoverWidth: number,
  popoverHeight: number
) {
  const gap = 8;
  let left = bubble.x - popoverWidth / 2;
  let top = bubble.y - bubble.r - gap - popoverHeight;

  // Clamp horizontally
  if (left < 4) left = 4;
  if (left + popoverWidth > containerWidth - 4) left = containerWidth - popoverWidth - 4;

  // If not enough space above, show below
  if (top < 4) {
    top = bubble.y + bubble.r + gap;
  }

  return { left, top };
}

export const TopicBubbleMap = memo(function TopicBubbleMap() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    containerRef.current = node;
    if (node) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);
  const [highlightCategory, setHighlightCategory] = useState<Category | null>(null);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);

  const { data, isLoading } = useSWR<TopicsResponse>(
    "/api/topics?sort=popular&limit=50",
    fetcher,
    { revalidateOnFocus: false }
  );

  const topics = data?.data?.topics ?? [];

  // Close popover when category filter changes
  useEffect(() => {
    setSelectedBubbleId(null);
  }, [highlightCategory]);

  // Close popover on outside click
  useEffect(() => {
    if (!selectedBubbleId) return;

    function handleClick(e: MouseEvent) {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) return;
      // Check if click is on an SVG bubble (handled by bubble onClick)
      const target = e.target as Element;
      if (target.closest("[data-bubble-id]")) return;
      setSelectedBubbleId(null);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedBubbleId(null);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBubbleId]);


  const bubbles = useMemo(() => {
    if (!topics.length || !containerWidth) return [];

    const height = Math.min(containerWidth * 0.65, 500);
    const maxVotes = Math.max(...topics.map((t) => t._count.votes), 1);
    const minR = 18;
    const maxR = Math.min(containerWidth / 8, 65);

    const nodes: BubbleNode[] = topics.map((topic) => {
      const ratio = topic._count.votes / maxVotes;
      const r = minR + ratio * (maxR - minR);
      return { r, topic };
    });

    const rootData: BubbleNode = { r: 0, topic: nodes[0].topic, children: nodes };

    const root = hierarchy<BubbleNode>(rootData)
      .sum((d) => (d.children ? 0 : d.r * d.r));

    const packer = pack<BubbleNode>()
      .size([containerWidth, height])
      .padding(3);

    const packed = packer(root);

    return packed.leaves().map((leaf) => ({
      x: leaf.x,
      y: leaf.y,
      r: leaf.r,
      topic: leaf.data.topic,
    }));
  }, [topics, containerWidth]);

  const svgHeight = useMemo(() => {
    if (!bubbles.length) return 300;
    const maxY = Math.max(...bubbles.map((b) => b.y + b.r));
    return Math.ceil(maxY + 10);
  }, [bubbles]);

  const selectedBubble = useMemo(
    () => bubbles.find((b) => b.topic.id === selectedBubbleId) ?? null,
    [bubbles, selectedBubbleId]
  );

  const handleBubbleClick = useCallback((id: string) => {
    setSelectedBubbleId((prev) => (prev === id ? null : id));
  }, []);

  const handleBubbleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleBubbleClick(id);
      }
    },
    [handleBubbleClick]
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex items-center justify-center" style={{ height: 300 }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      </div>
    );
  }

  if (!topics.length) return null;

  const popoverWidth = 288; // w-72
  const popoverHeight = 220; // approximate

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="mb-4 text-base font-semibold">토픽 버블맵</h2>
      <div ref={containerCallbackRef} className="relative w-full overflow-visible min-h-[200px]">
        {containerWidth > 0 && (
          <>
            <svg
              width={containerWidth}
              height={svgHeight}
              viewBox={`0 0 ${containerWidth} ${svgHeight}`}
              className="select-none"
            >
              {bubbles.map((bubble) => {
                const color = CATEGORY_COLORS[bubble.topic.category];
                const fill = isDark ? color.dark : color.light;
                const isHighlighted =
                  !highlightCategory || highlightCategory === bubble.topic.category;
                const isSelected = selectedBubbleId === bubble.topic.id;
                const r = isSelected ? bubble.r + 2 : bubble.r;
                const meta = CATEGORY_META[bubble.topic.category];
                const Icon = meta.icon;

                return (
                  <g
                    key={bubble.topic.id}
                    data-bubble-id={bubble.topic.id}
                    className="cursor-pointer"
                    style={{
                      opacity: isHighlighted ? 1 : 0.15,
                      transition: "opacity 0.2s",
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleBubbleClick(bubble.topic.id)}
                    onKeyDown={(e) => handleBubbleKeyDown(e, bubble.topic.id)}
                  >
                    <circle
                      cx={bubble.x}
                      cy={bubble.y}
                      r={r}
                      fill={fill}
                      fillOpacity={isDark ? 0.35 : 0.3}
                      stroke={fill}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    {bubble.r > 40 ? (
                      <text
                        x={bubble.x}
                        y={bubble.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-foreground text-xs font-medium pointer-events-none"
                      >
                        {truncateText(bubble.topic.title, Math.floor(bubble.r / 6))}
                      </text>
                    ) : bubble.r > 25 ? (
                      <text
                        x={bubble.x}
                        y={bubble.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="fill-foreground text-2xs pointer-events-none"
                      >
                        {truncateText(bubble.topic.title, Math.floor(bubble.r / 5))}
                      </text>
                    ) : (
                      <foreignObject
                        x={bubble.x - 7}
                        y={bubble.y - 7}
                        width={14}
                        height={14}
                        className="pointer-events-none"
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{ color: fill }}
                        />
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* HTML popover overlay */}
            {selectedBubble && (() => {
              const pos = getPopoverPosition(
                selectedBubble,
                containerWidth,
                popoverWidth,
                popoverHeight
              );
              return (
                <div
                  ref={popoverRef}
                  className="absolute z-50 w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                  style={{
                    left: pos.left,
                    top: pos.top,
                  }}
                >
                  <BubblePopoverContent topic={selectedBubble.topic} />
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Category Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const color = CATEGORY_COLORS[cat];
          const isActive = highlightCategory === cat;
          const hexColor = isDark ? color.dark : color.light;

          return (
            <button
              key={cat}
              onClick={() =>
                setHighlightCategory(isActive ? null : cat)
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "ring-2 ring-offset-1 ring-offset-background"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor: `${hexColor}20`,
                color: hexColor,
                ...(isActive ? { ringColor: hexColor } : {}),
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hexColor }}
              />
              {meta.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
