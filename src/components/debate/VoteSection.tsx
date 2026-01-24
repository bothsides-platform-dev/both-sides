"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import type { Side } from "@prisma/client";

interface VoteSectionProps {
  topicId: string;
  optionA: string;
  optionB: string;
}

interface VoteStats {
  aCount: number;
  bCount: number;
  total: number;
  aPercentage: number;
  bPercentage: number;
}

interface VoteInfoResponse {
  data: {
    stats: VoteStats;
    myVote: Side | null;
  };
}

export function VoteSection({ topicId, optionA, optionB }: VoteSectionProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const isVisibleRef = useRef(true);

  // Track tab visibility to pause polling when hidden
  useEffect(() => {
    const handler = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Use combined endpoint for vote stats and user's vote
  const includeMyVote = !!session?.user;
  const { data: voteInfoData } = useSWR<VoteInfoResponse>(
    `/api/topics/${topicId}/vote-info${includeMyVote ? "?includeMyVote=true" : ""}`,
    fetcher,
    {
      refreshInterval: 5000,
      isPaused: () => !isVisibleRef.current,
    }
  );

  const myVote = voteInfoData?.data?.myVote ?? undefined;
  const stats = voteInfoData?.data?.stats ?? {
    aCount: 0,
    bCount: 0,
    total: 0,
    aPercentage: 50,
    bPercentage: 50,
  };

  const handleVote = async (side: Side) => {
    if (!session?.user) {
      window.location.href = "/auth/signin";
      return;
    }

    setIsVoting(true);
    try {
      await fetch(`/api/topics/${topicId}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side }),
      });

      // Refresh combined vote info data
      mutate(`/api/topics/${topicId}/vote-info?includeMyVote=true`);
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">투표하기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button
            variant={myVote === "A" ? "sideA" : "sideAOutline"}
            className={cn(
              "flex-1 h-auto py-4 flex-col gap-1",
              myVote === "A" && "ring-2 ring-blue-500 ring-offset-2"
            )}
            onClick={() => handleVote("A")}
            disabled={isVoting}
          >
            {isVoting && myVote !== "A" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <span className="text-sm font-normal">A</span>
            <span className="text-base font-semibold">{optionA}</span>
          </Button>

          <Button
            variant={myVote === "B" ? "sideB" : "sideBOutline"}
            className={cn(
              "flex-1 h-auto py-4 flex-col gap-1",
              myVote === "B" && "ring-2 ring-red-500 ring-offset-2"
            )}
            onClick={() => handleVote("B")}
            disabled={isVoting}
          >
            {isVoting && myVote !== "B" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <span className="text-sm font-normal">B</span>
            <span className="text-base font-semibold">{optionB}</span>
          </Button>
        </div>

        {/* Vote Stats Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-600 font-medium">
              A: {stats.aPercentage}% ({stats.aCount}표)
            </span>
            <span className="text-red-600 font-medium">
              B: {stats.bPercentage}% ({stats.bCount}표)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="flex h-full">
              <div
                className="bg-blue-500 transition-all duration-300"
                style={{ width: `${stats.aPercentage}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${stats.bPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            총 {stats.total}명 참여
          </p>
        </div>

        {myVote && (
          <p className="text-center text-sm text-muted-foreground">
            {myVote === "A" ? optionA : optionB}에 투표하셨습니다
          </p>
        )}
      </CardContent>
    </Card>
  );
}
