"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetcher } from "@/lib/fetcher";
import { TrendingUp, ChevronRight, ChevronDown, MessageSquarePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TrendsApiResponse } from "@/modules/trends/types";

const STORAGE_KEY = "trending-ticker-open";

interface TrendingKeywordProps {
  rank: number;
  query: string;
  onOpenChange?: (open: boolean) => void;
}

function TrendingKeyword({ rank, query, onOpenChange }: TrendingKeywordProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 min-w-0 max-w-full hover:text-primary transition-colors"
          aria-label={`${query} 옵션 보기`}
        >
          <span className="text-xs font-bold text-muted-foreground">{rank}</span>
          <span className="text-sm font-medium truncate">{query}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <p className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            &ldquo;{query}&rdquo;
          </p>
          <Link
            href={`/topics/new?keyword=${encodeURIComponent(query)}`}
            className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            onClick={() => handleOpenChange(false)}
          >
            <MessageSquarePlus className="h-4 w-4 text-primary" />
            이 주제로 토론 만들기
          </Link>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors"
            onClick={() => handleOpenChange(false)}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            Google에서 검색
            <span className="sr-only">(새 창에서 열림)</span>
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TrendingTicker() {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { data, error, isLoading } = useSWR<TrendsApiResponse>(
    "/api/trends",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  // Load saved state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setIsOpen(saved === "true");
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, String(isOpen));
    }
  }, [isOpen, mounted]);

  if (isLoading) {
    return (
      <div className="w-full bg-muted/50 border-b">
        <div className="w-full px-4 md:px-8 lg:px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold">인기</span>
            </div>
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || data.data.trends.length === 0) {
    return null;
  }

  const trends = data.data.trends.slice(0, 10);
  // Duplicate for seamless infinite scroll
  const duplicatedTrends = [...trends, ...trends];

  return (
    <div className="w-full bg-muted/50 border-b">
      <div className="w-full px-4 md:px-8 lg:px-6 py-2">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center gap-3">
            {/* Label + Toggle Button */}
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 shrink-0 h-auto py-1 px-2 -ml-2"
                aria-expanded={isOpen}
              >
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">인기</span>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>

            {/* Desktop Ticker - Hidden when collapsed */}
            {isOpen && (
              <div className="hidden md:block flex-1 ticker-container overflow-hidden">
                <div className={`ticker-content flex items-center gap-6 ${popoverOpen ? "ticker-paused" : ""}`}>
                  {duplicatedTrends.map((trend, index) => (
                    <TrendingKeyword
                      key={`${trend.rank}-${index}`}
                      rank={trend.rank}
                      query={trend.query}
                      onOpenChange={setPopoverOpen}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Grid - Shows all keywords at once */}
          {isOpen && (
            <div className="md:hidden mt-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {trends.map((trend) => (
                  <TrendingKeyword
                    key={`mobile-${trend.rank}`}
                    rank={trend.rank}
                    query={trend.query}
                    onOpenChange={setPopoverOpen}
                  />
                ))}
              </div>
            </div>
          )}
        </Collapsible>
      </div>
    </div>
  );
}
