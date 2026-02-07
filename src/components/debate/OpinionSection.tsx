"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";

// Dynamic import for framer-motion to reduce bundle size (~40KB)
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { useSwipeableTabs } from "@/hooks/useSwipeableTabs";
import { useToast } from "@/components/ui/toast";
import { MobileSideTabs } from "./MobileSideTabs";
import { OpinionColumn } from "./OpinionColumn";
import { OpinionList } from "./OpinionList";
import { trackOpinionCreate } from "@/lib/analytics";
import type { Opinion } from "./types";
import type { Side, ReactionType } from "@prisma/client";

interface OpinionSectionProps {
  topicId: string;
  optionA: string;
  optionB: string;
  highlightReplyId?: string;
}

interface AncestorData {
  ancestorIds: string[];
  topLevelOpinionId: string;
  side: "A" | "B";
  topicId: string;
}

export function OpinionSection({ topicId, optionA, optionB, highlightReplyId }: OpinionSectionProps) {
  const { data: session } = useSession();
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [newOpinion, setNewOpinion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; error: string | null }>({
    isSubmitting: false,
    error: null,
  });
  const { showRateLimitError } = useToast();

  // Mobile swipe tabs
  const { activeTab, setActiveTab, handleDragEnd } = useSwipeableTabs();

  // Dynamic height for mobile swipe container
  const sideARef = useRef<HTMLDivElement>(null);
  const sideBRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  // Use combined vote-info endpoint (fetch for both logged-in and guest users)
  const { data: voteInfoData } = useSWR<{ data: { myVote: Side | null } }>(
    `/api/topics/${topicId}/vote-info?includeMyVote=true`,
    fetcher
  );

  const myVote = voteInfoData?.data?.myVote ?? undefined;

  // State for highlight reply ancestor data
  const [ancestorData, setAncestorData] = useState<AncestorData | null>(null);

  // Fetch ancestor data when highlightReplyId is provided
  useEffect(() => {
    if (!highlightReplyId) {
      setAncestorData(null);
      return;
    }

    const fetchAncestorData = async () => {
      try {
        const res = await fetch(`/api/opinions/${highlightReplyId}/ancestors`);
        if (res.ok) {
          const data = await res.json();
          setAncestorData(data.data);
          // Auto-switch mobile tab to the correct side
          if (data.data?.side) {
            setActiveTab(data.data.side);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ancestor data:", error);
      }
    };

    fetchAncestorData();
  }, [highlightReplyId, setActiveTab]);

  // Track active tab's content height for mobile swipe container
  useEffect(() => {
    const activeRef = activeTab === "A" ? sideARef : sideBRef;
    if (!activeRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    setContainerHeight(activeRef.current.scrollHeight);
    observer.observe(activeRef.current);
    return () => observer.disconnect();
  }, [activeTab]);

  // Fetch only top-level opinions (parentId=null)
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("parentId", "null");
    return params.toString();
  }, [sort]);

  const { data: opinionsData, isLoading } = useSWR<{ data: { opinions: Opinion[] } }>(
    `/api/topics/${topicId}/opinions?${queryParams}`,
    fetcher,
    {
      refreshInterval: 15000,
      dedupingInterval: 10000,
      isPaused: () => typeof document !== 'undefined' && document.hidden,
    }
  );

  // Memoize opinions to prevent unnecessary recalculations
  const opinions = useMemo<Opinion[]>(
    () => opinionsData?.data?.opinions ?? [],
    [opinionsData?.data?.opinions]
  );

  // Client-side filtering for A/B sides
  const opinionsA = useMemo(
    () => opinions.filter((op) => op.side === "A"),
    [opinions]
  );
  const opinionsB = useMemo(
    () => opinions.filter((op) => op.side === "B"),
    [opinions]
  );

  const isLoggedIn = !!session?.user;

  const handleSubmit = async () => {
    if (!newOpinion.trim() || !myVote) return;

    setSubmitState({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/topics/${topicId}/opinions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: newOpinion,
          isAnonymous: isLoggedIn ? isAnonymous : true,
        }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        showRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
        setSubmitState({ isSubmitting: false, error: null });
        return;
      }

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error);
      }

      // Track opinion creation event
      if (myVote) {
        trackOpinionCreate(topicId, myVote);
      }

      setNewOpinion("");
      setIsAnonymous(false);
      setSubmitState({ isSubmitting: false, error: null });
      mutate(`/api/topics/${topicId}/opinions?${queryParams}`);
    } catch (err) {
      setSubmitState({
        isSubmitting: false,
        error: err instanceof Error ? err.message : "의견 작성에 실패했습니다.",
      });
    }
  };

  const handleReaction = useCallback(async (opinionId: string, type: ReactionType) => {
    try {
      const res = await fetch(`/api/opinions/${opinionId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        showRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
        return;
      }

      mutate(`/api/topics/${topicId}/opinions?${queryParams}`);
    } catch (error) {
      console.error("Reaction failed:", error);
    }
  }, [topicId, queryParams, showRateLimitError]);

  const handleReportSuccess = useCallback(() => {
    // Refresh opinions list after successful report
    mutate(`/api/topics/${topicId}/opinions?${queryParams}`);
  }, [topicId, queryParams]);

  const handleReplySuccess = useCallback(() => {
    // Refresh opinions list after successful reply
    mutate(`/api/topics/${topicId}/opinions?${queryParams}`);
  }, [topicId, queryParams]);

  return (
    <Card>
      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">의견</CardTitle>
          <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "hot")}>
            <TabsList className="h-8">
              <TabsTrigger value="latest" className="text-xs px-2">최신</TabsTrigger>
              <TabsTrigger value="hot" className="text-xs px-2">인기</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* PC: 2-column layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4">
          <OpinionColumn
            side="A"
            sideLabel={optionA}
            opinions={opinionsA}
            optionA={optionA}
            optionB={optionB}
            isLoading={isLoading}
            currentUserId={session?.user?.id}
            onReaction={handleReaction}
            onReportSuccess={handleReportSuccess}
            onReplySuccess={handleReplySuccess}
            userVoteSide={myVote}
            highlightReplyId={highlightReplyId}
            expandedAncestorIds={ancestorData?.ancestorIds}
          />
          <OpinionColumn
            side="B"
            sideLabel={optionB}
            opinions={opinionsB}
            optionA={optionA}
            optionB={optionB}
            isLoading={isLoading}
            currentUserId={session?.user?.id}
            onReaction={handleReaction}
            onReportSuccess={handleReportSuccess}
            onReplySuccess={handleReplySuccess}
            userVoteSide={myVote}
            highlightReplyId={highlightReplyId}
            expandedAncestorIds={ancestorData?.ancestorIds}
          />
        </div>

        {/* Mobile: Tabs + Swipe */}
        <div className="md:hidden">
          <MobileSideTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            optionA={optionA}
            optionB={optionB}
            countA={opinionsA.length}
            countB={opinionsB.length}
          />

          <div
            className="overflow-hidden transition-[height] duration-300"
            style={containerHeight ? { height: containerHeight } : undefined}
          >
            <MotionDiv
              className="flex"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              animate={{ x: activeTab === "A" ? 0 : "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Side A opinions */}
              <div ref={sideARef} className="w-full flex-shrink-0 px-1">
                <OpinionList
                  opinions={opinionsA}
                  optionA={optionA}
                  optionB={optionB}
                  isLoading={isLoading}
                  emptyMessage={`${optionA} 측 의견이 없습니다. 첫 번째 의견을 남겨보세요!`}
                  currentUserId={session?.user?.id}
                  onReaction={handleReaction}
                  onReportSuccess={handleReportSuccess}
                  onReplySuccess={handleReplySuccess}
                  userVoteSide={myVote}
                  highlightReplyId={highlightReplyId}
                  expandedAncestorIds={ancestorData?.ancestorIds}
                />
              </div>

              {/* Side B opinions */}
              <div ref={sideBRef} className="w-full flex-shrink-0 px-1">
                <OpinionList
                  opinions={opinionsB}
                  optionA={optionA}
                  optionB={optionB}
                  isLoading={isLoading}
                  emptyMessage={`${optionB} 측 의견이 없습니다. 첫 번째 의견을 남겨보세요!`}
                  currentUserId={session?.user?.id}
                  onReaction={handleReaction}
                  onReportSuccess={handleReportSuccess}
                  onReplySuccess={handleReplySuccess}
                  userVoteSide={myVote}
                  highlightReplyId={highlightReplyId}
                  expandedAncestorIds={ancestorData?.ancestorIds}
                />
              </div>
            </MotionDiv>
          </div>
        </div>

        {/* New Opinion Form - shown for logged-in users and guests who have voted */}
        {myVote ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={myVote === "A" ? "sideA" : "sideB"} className="text-xs">
                {myVote === "A" ? optionA : optionB}
              </Badge>
              <span className="hidden sm:inline">측으로 의견을 작성합니다</span>
              <span className="sm:hidden">측</span>
              {!isLoggedIn && (
                <span className="text-xs text-muted-foreground/70">(손님)</span>
              )}
            </div>
            {submitState.error && (
              <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                {submitState.error}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Textarea
                  value={newOpinion}
                  onChange={(e) => setNewOpinion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      if (!submitState.isSubmitting && newOpinion.trim()) {
                        handleSubmit();
                      }
                    }
                  }}
                  placeholder="의견을 입력하세요"
                  className="min-h-[60px] md:min-h-[80px] resize-none text-sm md:text-base"
                  maxLength={1000}
                />
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={submitState.isSubmitting || !newOpinion.trim()}
                  className={cn(
                    "shrink-0 h-10 w-10 md:h-10 md:w-10",
                    myVote === "A" ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  {submitState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isLoggedIn && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="opinionAnonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                  />
                  <Label
                    htmlFor="opinionAnonymous"
                    className="text-xs font-normal cursor-pointer text-muted-foreground"
                  >
                    익명으로 작성
                  </Label>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted p-3 md:p-4 text-center text-sm text-muted-foreground">
            먼저 투표를 해주세요. 투표한 측에서만 의견을 작성할 수 있습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
