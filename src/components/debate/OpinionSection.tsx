"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";
import { Loader2, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Side, ReactionType } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Opinion {
  id: string;
  side: Side;
  body: string;
  isBlinded: boolean;
  createdAt: string;
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
    image?: string | null;
  };
  reactions: Array<{
    id: string;
    userId: string;
    type: ReactionType;
  }>;
  reactionSummary: {
    likes: number;
    dislikes: number;
  };
}

interface OpinionSectionProps {
  topicId: string;
  optionA: string;
  optionB: string;
}

export function OpinionSection({ topicId, optionA, optionB }: OpinionSectionProps) {
  const { data: session } = useSession();
  const [sideFilter, setSideFilter] = useState<Side | "ALL">("ALL");
  const [sort, setSort] = useState<"latest" | "hot">("latest");
  const [newOpinion, setNewOpinion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's vote to know if they can post opinions
  const { data: myVoteData } = useSWR(
    session?.user ? `/api/topics/${topicId}/my-vote` : null,
    fetcher
  );

  const myVote = myVoteData?.data?.side as Side | undefined;

  // Build query params
  const params = new URLSearchParams();
  if (sideFilter !== "ALL") params.set("side", sideFilter);
  params.set("sort", sort);

  const { data: opinionsData, isLoading } = useSWR(
    `/api/topics/${topicId}/opinions?${params.toString()}`,
    fetcher
  );

  const opinions: Opinion[] = opinionsData?.data?.opinions ?? [];

  const handleSubmit = async () => {
    if (!newOpinion.trim() || !session?.user) return;

    setIsSubmitting(true);
    setError(null);

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
      mutate(`/api/topics/${topicId}/opinions?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "의견 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (opinionId: string, type: ReactionType) => {
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

      mutate(`/api/topics/${topicId}/opinions?${params.toString()}`);
    } catch (error) {
      console.error("Reaction failed:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">의견</CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={sideFilter} onValueChange={(v) => setSideFilter(v as Side | "ALL")}>
              <TabsList className="h-8">
                <TabsTrigger value="ALL" className="text-xs px-2">전체</TabsTrigger>
                <TabsTrigger value="A" className="text-xs px-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">A</TabsTrigger>
                <TabsTrigger value="B" className="text-xs px-2 data-[state=active]:bg-red-500 data-[state=active]:text-white">B</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={sort} onValueChange={(v) => setSort(v as "latest" | "hot")}>
              <TabsList className="h-8">
                <TabsTrigger value="latest" className="text-xs px-2">최신</TabsTrigger>
                <TabsTrigger value="hot" className="text-xs px-2">인기</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
              {error && (
                <div className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                  {error}
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
                  disabled={isSubmitting || newOpinion.length < 10}
                  className={cn(
                    "shrink-0",
                    myVote === "A" ? "bg-blue-500 hover:bg-blue-600" : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  {isSubmitting ? (
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

        {/* Opinions List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : opinions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            아직 의견이 없습니다. 첫 번째 의견을 남겨보세요!
          </div>
        ) : (
          <div className="space-y-4">
            {opinions.map((opinion) => (
              <OpinionItem
                key={opinion.id}
                opinion={opinion}
                optionA={optionA}
                optionB={optionB}
                currentUserId={session?.user?.id}
                onReaction={handleReaction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OpinionItem({
  opinion,
  optionA,
  optionB,
  currentUserId,
  onReaction,
}: {
  opinion: Opinion;
  optionA: string;
  optionB: string;
  currentUserId?: string;
  onReaction: (opinionId: string, type: ReactionType) => void;
}) {
  const authorName = opinion.user.nickname || opinion.user.name || "익명";
  const sideLabel = opinion.side === "A" ? optionA : optionB;

  // Check if current user has reacted
  const userReaction = opinion.reactions.find((r) => r.userId === currentUserId);

  if (opinion.isBlinded) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        신고로 인해 블라인드 처리된 의견입니다.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        opinion.side === "A" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-red-500"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={opinion.user.image || undefined} />
          <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{authorName}</span>
            <Badge variant={opinion.side === "A" ? "sideA" : "sideB"} className="text-xs">
              {sideLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(opinion.createdAt)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{opinion.body}</p>
          <div className="flex items-center gap-4 pt-1">
            <button
              onClick={() => onReaction(opinion.id, "LIKE")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                userReaction?.type === "LIKE"
                  ? "text-blue-600"
                  : "text-muted-foreground hover:text-blue-600"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{opinion.reactionSummary.likes}</span>
            </button>
            <button
              onClick={() => onReaction(opinion.id, "DISLIKE")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                userReaction?.type === "DISLIKE"
                  ? "text-red-600"
                  : "text-muted-foreground hover:text-red-600"
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{opinion.reactionSummary.dislikes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
