"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Loader2, Clock } from "lucide-react";
import { cn, formatDDay, formatDate } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { trackVote } from "@/lib/analytics";
import type { Side } from "@prisma/client";

interface VoteSectionProps {
  topicId: string;
  optionA: string;
  optionB: string;
  deadline?: Date | string | null;
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

// 편승 효과 감소를 위한 로그 스케일(sqrt 압축) 적용
// 큰 차이도 시각적으로 접전처럼 보이게 함
function compressPercentage(percentage: number): number {
  const deviation = percentage - 50;
  const sign = deviation >= 0 ? 1 : -1;
  const absDeviation = Math.abs(deviation);
  const compressedDeviation =
    sign * (Math.sqrt(absDeviation) / Math.sqrt(50)) * 50;
  return 50 + compressedDeviation;
}

// 투표 상황을 설명하는 문구 생성
function getVoteStatusText(
  aPercentage: number,
  optionA: string,
  optionB: string
): string {
  const diff = Math.abs(aPercentage - 50);

  if (diff <= 5) {
    return "팽팽한 접전 중";
  } else if (aPercentage > 50) {
    return `${optionA}이(가) 앞서고 있습니다`;
  } else {
    return `${optionB}이(가) 앞서고 있습니다`;
  }
}

export function VoteSection({ topicId, optionA, optionB, deadline }: VoteSectionProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { showRateLimitError, showToast } = useToast();

  // Check if voting is closed
  const isVotingClosed = deadline ? new Date() > new Date(deadline) : false;
  const dDay = formatDDay(deadline ?? null);

  // Use combined endpoint for vote stats and user's vote
  // No polling - stats update only on vote (mutate) or page refresh
  const { data: voteInfoData } = useSWR<VoteInfoResponse>(
    `/api/topics/${topicId}/vote-info?includeMyVote=true`,
    fetcher,
    {
      revalidateOnFocus: false,
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
    setIsVoting(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side }),
      });

      if (!res.ok) {
        const retryAfter = res.headers.get("Retry-After");
        if (res.status === 429) {
          showRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
          return;
        }
        const data = await res.json();
        throw new ApiError(data.error || "투표에 실패했습니다.", res.status);
      }

      // Track vote event
      trackVote(topicId, side);

      // Refresh combined vote info data
      mutate(`/api/topics/${topicId}/vote-info?includeMyVote=true`);
    } catch (error) {
      if (error instanceof ApiError && error.isRateLimit) {
        showRateLimitError(error.retryAfter);
      } else {
        showToast(
          error instanceof Error ? error.message : "투표에 실패했습니다.",
          "error"
        );
      }
    } finally {
      setIsVoting(false);
    }
  };

  const showSpinnerA = isVoting && myVote !== "A";
  const showSpinnerB = isVoting && myVote !== "B";

  return (
    <div className="rounded-2xl bg-muted/30 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {isVotingClosed ? "투표 결과" : "투표하기"}
        </h2>
        {dDay && deadline && (
          <Popover>
            <PopoverTrigger asChild>
              <Badge
                variant={dDay === "마감" ? "secondary" : "default"}
                className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                suppressHydrationWarning
              >
                <Clock className="mr-1 h-3 w-3" />
                {dDay}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <p className="text-sm">
                <span className="font-medium">마감 시간</span>
                <br />
                <span suppressHydrationWarning>{formatDate(deadline)}</span>
              </p>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {isVotingClosed && (
        <p className="text-center text-sm text-muted-foreground">
          투표가 마감되었습니다
        </p>
      )}

      <div className="flex flex-row gap-3 sm:gap-4">
        <Button
          variant={myVote === "A" ? "sideA" : "sideAOutline"}
          className={cn(
            "flex-1 h-16 flex-col gap-1 sm:h-20 sm:gap-1.5 relative transition-all duration-200",
            "active:scale-[0.98]",
            myVote === "A" && "ring-2 ring-sideA ring-offset-2 shadow-lg"
          )}
          onClick={() => handleVote("A")}
          disabled={isVoting || isVotingClosed}
          aria-pressed={myVote === "A"}
          aria-label={`${optionA}에 투표`}
        >
          {showSpinnerA && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <span
            className={cn("text-xs sm:text-sm font-medium opacity-70", showSpinnerA && "invisible")}
          >
            A
          </span>
          <span
            className={cn("text-sm sm:text-base md:text-lg font-bold line-clamp-1", showSpinnerA && "invisible")}
          >
            {optionA}
          </span>
        </Button>

        <Button
          variant={myVote === "B" ? "sideB" : "sideBOutline"}
          className={cn(
            "flex-1 h-16 flex-col gap-1 sm:h-20 sm:gap-1.5 relative transition-all duration-200",
            "active:scale-[0.98]",
            myVote === "B" && "ring-2 ring-sideB ring-offset-2 shadow-lg"
          )}
          onClick={() => handleVote("B")}
          disabled={isVoting || isVotingClosed}
          aria-pressed={myVote === "B"}
          aria-label={`${optionB}에 투표`}
        >
          {showSpinnerB && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <span
            className={cn("text-xs sm:text-sm font-medium opacity-70", showSpinnerB && "invisible")}
          >
            B
          </span>
          <span
            className={cn("text-sm sm:text-base md:text-lg font-bold line-clamp-1", showSpinnerB && "invisible")}
          >
            {optionB}
          </span>
        </Button>
      </div>

      {/* Vote Stats Bar - 숫자 없이 압축된 비율로 표시 */}
      <div className="space-y-2">
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="flex h-full">
            <div
              className="bg-sideA transition-all duration-300"
              style={{ width: `${compressPercentage(stats.aPercentage)}%` }}
            />
            <div
              className="bg-sideB transition-all duration-300"
              style={{
                width: `${100 - compressPercentage(stats.aPercentage)}%`,
              }}
            />
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {getVoteStatusText(stats.aPercentage, optionA, optionB)}
        </p>
      </div>

      {myVote && (
        <p className="text-center text-sm text-muted-foreground">
          {myVote === "A" ? optionA : optionB}에 투표하셨습니다
        </p>
      )}
    </div>
  );
}
