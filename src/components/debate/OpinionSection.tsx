"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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

  // Use combined vote-info endpoint
  const { data: voteInfoData } = useSWR<{ data: { myVote: Side | null } }>(
    session?.user ? `/api/topics/${topicId}/vote-info?includeMyVote=true` : null,
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

  // Fetch only top-level opinions (parentId=null)
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("parentId", "null");
    return params.toString();
  }, [sort]);

  const { data: opinionsData, isLoading } = useSWR<{ data: { opinions: Opinion[] } }>(
    `/api/topics/${topicId}/opinions?${queryParams}`,
    fetcher
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

  const handleSubmit = async () => {
    if (!newOpinion.trim() || !session?.user) return;

    setSubmitState({ isSubmitting: true, error: null });

    try {
      const res = await fetch(`/api/topics/${topicId}/opinions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newOpinion, isAnonymous }),
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
      <CardHeader className="pb-3">
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
      <CardContent className="space-y-4">
        {/* New Opinion Form */}
        {session?.user ? (
          myVote ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={myVote === "A" ? "sideA" : "sideB"} className="text-xs">
                  {myVote === "A" ? optionA : optionB}
                </Badge>
                측으로 의견을 작성합니다
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
                    className="min-h-[80px] resize-none"
                    maxLength={1000}
                  />
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={submitState.isSubmitting || !newOpinion.trim()}
                    className={cn(
                      "shrink-0",
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
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              먼저 투표를 해주세요. 투표한 측에서만 의견을 작성할 수 있습니다.
            </div>
          )
        ) : (
          <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            의견을 작성하려면{" "}
            <a href="/auth/signin" className="text-primary underline">
              로그인
            </a>
            해주세요.
          </div>
        )}

        {/* PC: 2-column layout */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-6">
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

          <div className="overflow-hidden">
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
              <div className="w-full flex-shrink-0 px-1">
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
              <div className="w-full flex-shrink-0 px-1">
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
      </CardContent>
    </Card>
  );
}
