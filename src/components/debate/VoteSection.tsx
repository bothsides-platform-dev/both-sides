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

function getVoteStatusText(aPercentage: number, optionA: string, optionB: string): string {
  const diff = Math.abs(aPercentage - 50);
  if (diff <= 5) return "팽팽한 접전 중";
  else if (aPercentage > 50) return `${optionA}이(가) 앞서고 있습니다`;
  else return `${optionB}이(가) 앞서고 있습니다`;
}

const voteButtonConfig = {
  A: {
    selectedVariant: "sideA",
    unselectedVariant: "sideAOutline",
    ringClass: "ring-2 ring-sideA ring-offset-2 shadow-lg",
  },
  B: {
    selectedVariant: "sideB",
    unselectedVariant: "sideBOutline",
    ringClass: "ring-2 ring-sideB ring-offset-2 shadow-lg",
  },
} as const;

interface VoteButtonProps {
  side: Side;
  optionText: string;
  selected: boolean;
  isVoting: boolean;
  isVotingClosed: boolean;
  onVote: (side: Side) => Promise<void> | void;
}

function VoteButton({ side, optionText, selected, isVoting, isVotingClosed, onVote }: VoteButtonProps) {
  const { selectedVariant, unselectedVariant, ringClass } = voteButtonConfig[side];
  const showSpinner = isVoting && !selected;
  const optionLabel = side;

  return (
    <Button
      variant={selected ? selectedVariant : unselectedVariant}
      className={cn(
        "flex-1 min-w-0 whitespace-normal min-h-14 py-3 flex-col gap-0.5 sm:min-h-20 sm:py-4 sm:gap-1.5 relative transition-all duration-200",
        "active:scale-[0.98]",
        selected && ringClass
      )}
      onClick={() => onVote(side)}
      disabled={isVoting || isVotingClosed}
      aria-pressed={selected}
      aria-label={`${optionText}에 투표`}
    >
      {showSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      <span className={cn("text-xs sm:text-sm font-medium opacity-70", showSpinner && "invisible")}>
        {optionLabel}
      </span>
      <span className={cn("text-sm sm:text-base md:text-lg font-bold", showSpinner && "invisible")}>
        {optionText}
      </span>
    </Button>
  );
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

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <VoteButton
          side="A"
          optionText={optionA}
          selected={myVote === "A"}
          isVoting={isVoting}
          isVotingClosed={isVotingClosed}
          onVote={handleVote}
        />

        <VoteButton
          side="B"
          optionText={optionB}
          selected={myVote === "B"}
          isVoting={isVoting}
          isVotingClosed={isVotingClosed}
          onVote={handleVote}
        />
      </div>

      {/* Vote Stats Bar */}
      <div className="space-y-2">
        {stats.total > 0 ? (
          <>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-sideA">
                {stats.aPercentage.toFixed(0)}% ({stats.aCount}명)
              </span>
              <span className="text-sideB">
                {stats.bPercentage.toFixed(0)}% ({stats.bCount}명)
              </span>
            </div>
            <div
              className="h-5 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`투표 비율: ${optionA} ${stats.aPercentage.toFixed(0)}%, ${optionB} ${stats.bPercentage.toFixed(0)}%`}
            >
              <div className="flex h-full">
                <div
                  className="bg-sideA transition-all duration-300"
                  style={{ width: `${stats.aPercentage}%` }}
                />
                <div
                  className="bg-sideB transition-all duration-300"
                  style={{ width: `${stats.bPercentage}%` }}
                />
              </div>
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground">
              {getVoteStatusText(stats.aPercentage, optionA, optionB)}
            </p>
          </>
        ) : (
          <p className="text-center text-sm font-medium text-muted-foreground">
            아직 투표가 없습니다
          </p>
        )}
      </div>

      {myVote && (
        <p className="text-center text-sm text-muted-foreground">
          {myVote === "A" ? optionA : optionB}에 투표하셨습니다
        </p>
      )}
    </div>
  );
}
