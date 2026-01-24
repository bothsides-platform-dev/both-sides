"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { useSwipeableTabs } from "@/hooks/useSwipeableTabs";
import { MobileSideTabs } from "./MobileSideTabs";
import { OpinionColumn } from "./OpinionColumn";
import { OpinionList } from "./OpinionList";
import type { Opinion } from "./types";
import type { Side, ReactionType } from "@prisma/client";

interface OpinionSectionProps {
  topicId: string;
  optionA: string;
  optionB: string;
}

export function OpinionSection({ topicId, optionA, optionB }: OpinionSectionProps) {
  const { data: session } = useSession();
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [newOpinion, setNewOpinion] = useState("");
  const [submitState, setSubmitState] = useState<{ isSubmitting: boolean; error: string | null }>({
    isSubmitting: false,
    error: null,
  });

  // Mobile swipe tabs
  const { activeTab, setActiveTab, handleDragEnd } = useSwipeableTabs();

  // Use combined vote-info endpoint
  const { data: voteInfoData } = useSWR<{ data: { myVote: Side | null } }>(
    session?.user ? `/api/topics/${topicId}/vote-info?includeMyVote=true` : null,
    fetcher
  );

  const myVote = voteInfoData?.data?.myVote ?? undefined;

  // Fetch all opinions without side filter
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("sort", sort);
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
        body: JSON.stringify({ body: newOpinion }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error);
      }

      setNewOpinion("");
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
    if (!session?.user) {
      window.location.href = "/auth/signin";
      return;
    }

    try {
      await fetch(`/api/opinions/${opinionId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      mutate(`/api/topics/${topicId}/opinions?${queryParams}`);
    } catch (error) {
      console.error("Reaction failed:", error);
    }
  }, [session?.user, topicId, queryParams]);

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
              <div className="flex gap-2">
                <Textarea
                  value={newOpinion}
                  onChange={(e) => setNewOpinion(e.target.value)}
                  placeholder="의견을 입력하세요 (최소 10자)"
                  className="min-h-[80px] resize-none"
                  maxLength={1000}
                />
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={submitState.isSubmitting || newOpinion.length < 10}
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
            <motion.div
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
                />
              </div>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
