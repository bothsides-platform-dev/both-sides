"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Clock, Send } from "lucide-react";
import { cn, formatDDay, formatDate } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-error";
import { trackVote } from "@/lib/analytics";

interface NumericVoteStats {
  type: "NUMERIC";
  average: number;
  median: number;
  min: number;
  max: number;
  total: number;
  distribution: Array<{ rangeLabel: string; count: number }>;
}

interface VoteInfoResponse {
  data: {
    stats: NumericVoteStats;
    myVote: number | null;
  };
}

interface NumericVoteSectionProps {
  topicId: string;
  unit: string;
  min?: number | null;
  max?: number | null;
  deadline?: Date | string | null;
}

export function NumericVoteSection({ topicId, unit, min, max, deadline }: NumericVoteSectionProps) {
  const [inputValue, setInputValue] = useState("");
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

  const handleSubmit = async () => {
    const numericValue = parseInt(inputValue, 10);
    if (isNaN(numericValue)) {
      showToast("정수를 입력해주세요.", "error");
      return;
    }
    if (min != null && numericValue < min) {
      showToast(`최소값은 ${min}${unit}입니다.`, "error");
      return;
    }
    if (max != null && numericValue > max) {
      showToast(`최대값은 ${max}${unit}입니다.`, "error");
      return;
    }

    setIsVoting(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numericValue }),
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

      trackVote(topicId, "NUMERIC");
      mutate(`/api/topics/${topicId}/vote-info?includeMyVote=true`);
      setInputValue("");
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

  const maxDistCount = stats?.distribution
    ? Math.max(...stats.distribution.map((d) => d.count), 1)
    : 1;

  return (
    <div className="rounded-2xl bg-muted/30 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {isVotingClosed ? "입력 결과" : "숫자 입력"}
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

      {/* Input area */}
      {!isVotingClosed && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!isVoting && inputValue) handleSubmit();
                }
              }}
              placeholder={
                min != null && max != null
                  ? `${min} ~ ${max}`
                  : min != null
                  ? `${min} 이상`
                  : max != null
                  ? `${max} 이하`
                  : "숫자를 입력하세요"
              }
              className="text-lg"
              disabled={isVoting || isVotingClosed}
            />
            <span className="text-lg font-medium text-muted-foreground shrink-0">
              {unit}
            </span>
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isVoting || !inputValue || isVotingClosed}
              className="shrink-0 h-10 w-10"
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          {(min != null || max != null) && (
            <p className="text-xs text-muted-foreground">
              {min != null && max != null
                ? `${min}${unit} ~ ${max}${unit} 범위`
                : min != null
                ? `최소 ${min}${unit}`
                : `최대 ${max}${unit}`}
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {stats && stats.total > 0 && (
        <div className="space-y-4">
          {/* Average display */}
          <div className="text-center space-y-1">
            <p className="text-3xl font-bold text-primary">
              {stats.average.toLocaleString()}{unit}
            </p>
            <p className="text-sm text-muted-foreground">
              평균값 (총 {stats.total}명 참여)
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-background p-2">
              <p className="text-xs text-muted-foreground">중앙값</p>
              <p className="font-semibold">{stats.median.toLocaleString()}{unit}</p>
            </div>
            <div className="rounded-lg bg-background p-2">
              <p className="text-xs text-muted-foreground">최소</p>
              <p className="font-semibold">{stats.min.toLocaleString()}{unit}</p>
            </div>
            <div className="rounded-lg bg-background p-2">
              <p className="text-xs text-muted-foreground">최대</p>
              <p className="font-semibold">{stats.max.toLocaleString()}{unit}</p>
            </div>
          </div>

          {/* Distribution bars */}
          {stats.distribution.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">분포</p>
              {stats.distribution.map((bucket) => (
                <div key={bucket.rangeLabel} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-right text-muted-foreground shrink-0 tabular-nums">
                    {bucket.rangeLabel}
                  </span>
                  <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded transition-all duration-300"
                      style={{ width: `${(bucket.count / maxDistCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground tabular-nums">{bucket.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stats && stats.total === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          아직 입력이 없습니다
        </p>
      )}

      {myVote != null && (
        <p className="text-center text-sm text-muted-foreground">
          {myVote.toLocaleString()}{unit}을(를) 입력하셨습니다
        </p>
      )}
    </div>
  );
}
