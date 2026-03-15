"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Clock, Check } from "lucide-react";
import { cn, formatDDay, formatDate } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { trackVote } from "@/lib/analytics";

const OPTION_COLORS = [
  "bg-sideA",
  "bg-sideB",
  "bg-sideC",
  "bg-sideD",
  "bg-sideE",
  "bg-sideF",
] as const;

const OPTION_TEXT_COLORS = [
  "text-sideA",
  "text-sideB",
  "text-sideC",
  "text-sideD",
  "text-sideE",
  "text-sideF",
] as const;

interface TopicOption {
  id: string;
  label: string;
  displayOrder: number;
}

interface MultipleVoteStats {
  type: "MULTIPLE";
  options: Array<{ id: string; label: string; count: number; percentage: number }>;
  total: number;
}

interface VoteInfoResponse {
  data: {
    stats: MultipleVoteStats;
    myVote: string | null; // optionId
  };
}

interface MultipleVoteSectionProps {
  topicId: string;
  options: TopicOption[];
  deadline?: Date | string | null;
}

export function MultipleVoteSection({ topicId, options, deadline }: MultipleVoteSectionProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { showRateLimitError, showToast } = useToast();

  const isVotingClosed = deadline ? new Date() > new Date(deadline) : false;
  const dDay = formatDDay(deadline ?? null);

  const { data: voteInfoData } = useSWR<VoteInfoResponse>(
    `/api/topics/${topicId}/vote-info?includeMyVote=true`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const myVote = voteInfoData?.data?.myVote ?? null;
  const stats = voteInfoData?.data?.stats;

  const handleVote = async (optionId: string) => {
    setIsVoting(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
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

      trackVote(topicId, "MULTIPLE");
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

  const total = stats?.total ?? 0;

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

      {/* Option buttons */}
      <div className="flex flex-col gap-2">
        {options.map((option, index) => {
          const isSelected = myVote === option.id;
          const statOption = stats?.options?.find((o) => o.id === option.id);
          const percentage = statOption?.percentage ?? 0;
          const count = statOption?.count ?? 0;
          const colorClass = OPTION_COLORS[index % OPTION_COLORS.length];
          const textColorClass = OPTION_TEXT_COLORS[index % OPTION_TEXT_COLORS.length];

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isVoting || isVotingClosed}
              className={cn(
                "relative w-full rounded-lg border p-3 text-left transition-all overflow-hidden",
                "hover:shadow-sm active:scale-[0.99]",
                isSelected
                  ? "border-foreground/30 ring-2 ring-foreground/20"
                  : "border-border hover:border-foreground/20"
              )}
            >
              {/* Background bar */}
              {myVote && (
                <div
                  className={cn("absolute inset-y-0 left-0 opacity-15 transition-all duration-500", colorClass)}
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSelected && <Check className={cn("h-4 w-4", textColorClass)} />}
                  <span className={cn("font-medium", isSelected && textColorClass)}>
                    {option.label}
                  </span>
                </div>
                {myVote && (
                  <span className={cn("text-sm font-medium", textColorClass)}>
                    {percentage}% ({count}명)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Total count */}
      {total > 0 && (
        <p className="text-center text-sm font-medium text-muted-foreground">
          총 {total}명 참여
        </p>
      )}

      {myVote && (
        <p className="text-center text-sm text-muted-foreground">
          {options.find((o) => o.id === myVote)?.label}에 투표하셨습니다
        </p>
      )}

      {isVoting && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
