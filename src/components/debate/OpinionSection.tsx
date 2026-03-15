"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
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
import { useTopicSSE } from "@/hooks/useTopicSSE";
import { useToast } from "@/components/ui/toast";
import { MobileSideTabs } from "./MobileSideTabs";
import { OpinionColumn } from "./OpinionColumn";
import { OpinionList } from "./OpinionList";
import { trackOpinionCreate } from "@/lib/analytics";
import type { Opinion } from "./types";
import type { Side, ReactionType, TopicType } from "@prisma/client";

interface TopicOption {
  id: string;
  label: string;
  displayOrder: number;
}

interface OpinionSectionProps {
  topicId: string;
  topicType?: TopicType;
  optionA: string;
  optionB: string;
  options?: TopicOption[];
  numericUnit?: string | null;
  highlightReplyId?: string;
}

interface AncestorData {
  ancestorIds: string[];
  topLevelOpinionId: string;
  side: "A" | "B";
  topicId: string;
}

export function OpinionSection({ topicId, topicType = "BINARY", optionA, optionB, options, numericUnit, highlightReplyId }: OpinionSectionProps) {
  const { data: session } = useSession();
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [newOpinion, setNewOpinion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; error: string | null }>({
    isSubmitting: false,
    error: null,
  });
  const [isOpinionFocused, setIsOpinionFocused] = useState(false);
  const { showRateLimitError } = useToast();

  // Mobile swipe tabs
  const { activeTab, setActiveTab } = useSwipeableTabs();

  // Dynamic height for mobile swipe container
  const sideARef = useRef<HTMLDivElement>(null);
  const sideBRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);
  const [sideAHeight, setSideAHeight] = useState<number>(0);
  const [sideBHeight, setSideBHeight] = useState<number>(0);

  // Use combined vote-info endpoint (fetch for both logged-in and guest users)
  const { data: voteInfoData } = useSWR<{ data: { myVote: Side | string | number | null } }>(
    `/api/topics/${topicId}/vote-info?includeMyVote=true`,
    fetcher
  );

  const rawMyVote = voteInfoData?.data?.myVote ?? undefined;
  // For BINARY topics, myVote is Side; for others it's optionId or numericValue
  const myVote = topicType === "BINARY" ? (rawMyVote as Side | undefined) : undefined;
  const myOptionId = topicType === "MULTIPLE" ? (rawMyVote as string | undefined) : undefined;
  const myNumericValue = topicType === "NUMERIC" ? (rawMyVote as number | undefined) : undefined;
  // hasVoted: true if the user has voted in any form
  const hasVoted = rawMyVote != null;

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

  // Observe both sides simultaneously (no re-creation on tab change)
  useEffect(() => {
    if (!sideARef.current || !sideBRef.current) return;
    const refA = sideARef.current;
    const refB = sideBRef.current;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (entry.target === refA) setSideAHeight(h);
        else if (entry.target === refB) setSideBHeight(h);
      }
    });

    setSideAHeight(refA.scrollHeight);
    setSideBHeight(refB.scrollHeight);
    observer.observe(refA);
    observer.observe(refB);
    return () => observer.disconnect();
  }, []);

  // Apply the correct side's height when tab changes
  useEffect(() => {
    const height = activeTab === "A" ? sideAHeight : sideBHeight;
    if (height > 0) setContainerHeight(height);
  }, [activeTab, sideAHeight, sideBHeight]);

  // Fetch only top-level opinions (parentId=null)
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("parentId", "null");
    return params.toString();
  }, [sort]);

  const mutateKeyRef = useRef(`/api/topics/${topicId}/opinions?${queryParams}`);
  mutateKeyRef.current = `/api/topics/${topicId}/opinions?${queryParams}`;

  const { isConnected: sseConnected } = useTopicSSE(
    useCallback((event: { type: string }) => {
      if (event.type === "opinion:new" || event.type === "opinion:reply") {
        mutate(mutateKeyRef.current);
      }
    }, [])
  );

  const { data: opinionsData, isLoading } = useSWR<{ data: { opinions: Opinion[] } }>(
    `/api/topics/${topicId}/opinions?${queryParams}`,
    fetcher,
    {
      refreshInterval: sseConnected ? 0 : 15000,
      dedupingInterval: 10000,
      isPaused: () => typeof document !== 'undefined' && document.hidden,
    }
  );

  // Memoize opinions to prevent unnecessary recalculations
  const opinions = useMemo<Opinion[]>(
    () => opinionsData?.data?.opinions ?? [],
    [opinionsData?.data?.opinions]
  );

  // Client-side filtering for A/B sides (BINARY) or by optionId (MULTIPLE)
  const opinionsA = useMemo(
    () => opinions.filter((op) => op.side === "A"),
    [opinions]
  );
  const opinionsB = useMemo(
    () => opinions.filter((op) => op.side === "B"),
    [opinions]
  );

  // For MULTIPLE: group opinions by optionId
  const opinionsByOption = useMemo(() => {
    if (topicType !== "MULTIPLE" || !options) return {};
    const map: Record<string, Opinion[]> = {};
    for (const opt of options) {
      map[opt.id] = opinions.filter((op) => op.optionId === opt.id);
    }
    return map;
  }, [opinions, options, topicType]);

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
        {topicType === "NUMERIC" ? (
          /* NUMERIC: Single stream, no side split */
          <div>
            <OpinionList
              opinions={opinions}
              optionA={optionA}
              optionB={optionB}
              isLoading={isLoading}
              emptyMessage="아직 의견이 없습니다. 첫 번째 의견을 남겨보세요!"
              currentUserId={session?.user?.id}
              onReaction={handleReaction}
              onReportSuccess={handleReportSuccess}
              onReplySuccess={handleReplySuccess}
              userVoteSide={myVote}
              highlightReplyId={highlightReplyId}
              expandedAncestorIds={ancestorData?.ancestorIds}
              topicType={topicType}
              numericUnit={numericUnit}
            />
          </div>
        ) : topicType === "MULTIPLE" && options ? (
          /* MULTIPLE: Scrollable tabs for N options */
          <>
            {/* PC: columns for each option (max 3 columns) */}
            <div className="hidden md:grid md:gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, 1fr)` }}>
              {options.map((opt) => (
                <OpinionColumn
                  key={opt.id}
                  side="A"
                  sideLabel={opt.label}
                  opinions={opinionsByOption[opt.id] || []}
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
              ))}
            </div>

            {/* Mobile: Scrollable tabs */}
            <div className="md:hidden">
              <MobileSideTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                optionA={optionA}
                optionB={optionB}
                countA={opinionsA.length}
                countB={opinionsB.length}
                multipleOptions={options}
                opinionsByOption={opinionsByOption}
              />

              <div>
                {options.map((opt) => {
                  const isActive = activeTab === "A"
                    ? opt.displayOrder === 0
                    : activeTab === "B"
                    ? opt.displayOrder === 1
                    : false;
                  // For multiple options, show active option's opinions
                  // Use displayOrder-based matching with activeTab override
                  return null; // handled below
                })}
                <OpinionList
                  opinions={
                    (() => {
                      // Find the active option by tab
                      const activeIndex = activeTab === "A" ? 0 : 1;
                      const activeOpt = options[activeIndex];
                      return activeOpt ? (opinionsByOption[activeOpt.id] || []) : [];
                    })()
                  }
                  optionA={optionA}
                  optionB={optionB}
                  isLoading={isLoading}
                  emptyMessage="이 선택지에 대한 의견이 없습니다."
                  currentUserId={session?.user?.id}
                  onReaction={handleReaction}
                  onReportSuccess={handleReportSuccess}
                  onReplySuccess={handleReplySuccess}
                  userVoteSide={myVote}
                  highlightReplyId={highlightReplyId}
                  expandedAncestorIds={ancestorData?.ancestorIds}
                />
              </div>
            </div>
          </>
        ) : (
          /* BINARY: Original 2-column layout */
          <>
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
                <LazyMotion features={domAnimation}>
                <m.div
                  className="flex"
                  initial={false}
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
                </m.div>
                </LazyMotion>
              </div>
            </div>
          </>
        )}

        {/* New Opinion Form - shown for logged-in users and guests who have voted */}
        {hasVoted ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {topicType === "BINARY" && myVote && (
                <>
                  <Badge variant={myVote === "A" ? "sideA" : "sideB"} className="text-xs">
                    {myVote === "A" ? optionA : optionB}
                  </Badge>
                  <span className="hidden sm:inline">측으로 의견을 작성합니다</span>
                  <span className="sm:hidden">측</span>
                </>
              )}
              {topicType === "MULTIPLE" && myOptionId && options && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {options.find((o) => o.id === myOptionId)?.label}
                  </Badge>
                  <span className="hidden sm:inline">에 투표한 의견입니다</span>
                </>
              )}
              {topicType === "NUMERIC" && myNumericValue != null && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {myNumericValue.toLocaleString()}{numericUnit || ""}
                  </Badge>
                  <span className="hidden sm:inline">을(를) 입력한 의견입니다</span>
                </>
              )}
              {!isLoggedIn && (
                <span className="text-xs text-muted-foreground/80">(손님)</span>
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
                  onFocus={() => setIsOpinionFocused(true)}
                  onBlur={() => setIsOpinionFocused(false)}
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
                  aria-label="의견 입력"
                />
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={submitState.isSubmitting || !newOpinion.trim()}
                  className={cn(
                    "shrink-0 h-11 w-11",
                    topicType === "BINARY"
                      ? myVote === "A" ? "bg-sideA hover:bg-sideA/90" : "bg-sideB hover:bg-sideB/90"
                      : "bg-primary hover:bg-primary/90"
                  )}
                  aria-label="의견 등록"
                >
                  {submitState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                {isLoggedIn ? (
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
                ) : (
                  <div />
                )}
                {(isOpinionFocused || newOpinion.length > 0) && (
                  <div className="text-xs text-muted-foreground text-right" aria-live="polite">
                    {newOpinion.length} / 1000
                  </div>
                )}
              </div>
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
