"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Users,
  Plus,
  Search,
  Sparkles,
  Settings2,
} from "lucide-react";
import { LlmStatusBadge } from "./LlmStatusBadge";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Category } from "@prisma/client";

type FilterType = "all" | "needs_summary" | "needs_grounds" | "complete";

interface TopicItem {
  id: string;
  title: string;
  category: Category;
  createdAt: string;
  _count: { votes: number; opinions: number };
  hasSummary: boolean;
  hasGroundsA: boolean;
  hasGroundsB: boolean;
  opinionCount: number;
  meetsMinimumForSummary: boolean;
  meetsMinimumForGrounds: boolean;
}

interface TopicsApiResponse {
  data: {
    topics: TopicItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface BotAccountsApiResponse {
  data: {
    bots: Array<{ id: string; nickname: string; createdAt: string }>;
    total: number;
  };
}

export function UnifiedBotOpinionGeneration() {
  // Bot accounts state
  const { data: botData, mutate: mutateBots } = useSWR<BotAccountsApiResponse>(
    "/api/admin/llm/bot-accounts",
    fetcher
  );
  const [showBotModal, setShowBotModal] = useState(false);

  // Anonymous probability state
  const [anonymousProbability, setAnonymousProbability] = useState(60);

  // Topic list state
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  // Opinion generation state
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null);
  const [generationResults, setGenerationResults] = useState<
    Record<string, { generatedA: number; generatedB: number; errors: string[] }>
  >({});

  const { data: topicsData, mutate: mutateTopics } = useSWR<TopicsApiResponse>(
    `/api/admin/llm/topics?page=${page}&limit=20&filter=${filter}&search=${search}`,
    fetcher
  );

  const botCount = botData?.data?.total ?? 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleGenerateOpinions = async (
    topicId: string,
    countA: number,
    countB: number
  ) => {
    if (botCount === 0) {
      alert("봇 계정을 먼저 생성하세요!");
      return;
    }

    setGeneratingTopicId(topicId);
    try {
      const res = await fetch("/api/admin/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          countA,
          countB,
          anonymousProbability,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "의견 생성 실패");
      }

      const json = await res.json();
      setGenerationResults((prev) => ({
        ...prev,
        [topicId]: json.data,
      }));

      // Auto-clear result after 5 seconds
      setTimeout(() => {
        setGenerationResults((prev) => {
          const newResults = { ...prev };
          delete newResults[topicId];
          return newResults;
        });
      }, 5000);

      mutateTopics();
    } catch (err) {
      const message = err instanceof Error ? err.message : "의견 생성 실패";
      alert(message);
    } finally {
      setGeneratingTopicId(null);
    }
  };

  const filterTabs: { value: FilterType; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "needs_summary", label: "요약 필요" },
    { value: "needs_grounds", label: "논거 필요" },
    { value: "complete", label: "AI 완료" },
  ];

  return (
    <div className="space-y-6">
      {/* Bot Account Status Card */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">봇 계정 현황</div>
              <div className="text-sm text-muted-foreground">
                현재 {botCount}개의 봇 계정이 있습니다
              </div>
            </div>
          </div>
          <Button onClick={() => setShowBotModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            봇 계정 추가
          </Button>
        </CardContent>
      </Card>

      {/* Anonymous Probability Slider Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            익명 확률 설정
          </CardTitle>
          <CardDescription>
            생성되는 의견이 익명으로 표시될 확률을 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[anonymousProbability]}
              onValueChange={([val]) => setAnonymousProbability(val)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <div className="w-16 text-center font-mono text-lg font-medium">
              {anonymousProbability}%
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {anonymousProbability === 0 && "모든 의견이 실명으로 표시됩니다"}
            {anonymousProbability === 100 && "모든 의견이 익명으로 표시됩니다"}
            {anonymousProbability > 0 &&
              anonymousProbability < 100 &&
              `약 ${anonymousProbability}%의 의견이 익명으로, ${
                100 - anonymousProbability
              }%가 실명으로 표시됩니다`}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={filter === tab.value ? "default" : "outline"}
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="토론 제목 또는 설명으로 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>검색</Button>
      </div>

      {/* Topics List with Inline Generation */}
      {!topicsData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : topicsData.data.topics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          조건에 맞는 토론이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {topicsData.data.topics.map((topic) => (
            <TopicCardWithGeneration
              key={topic.id}
              topic={topic}
              botCount={botCount}
              isGenerating={generatingTopicId === topic.id}
              result={generationResults[topic.id]}
              onGenerate={handleGenerateOpinions}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {topicsData && topicsData.data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, topicsData.data.pagination.totalPages) },
              (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setPage((p) =>
                Math.min(topicsData.data.pagination.totalPages, p + 1)
              )
            }
            disabled={page === topicsData.data.pagination.totalPages}
          >
            다음
          </Button>
        </div>
      )}

      {/* Bot Creation Modal */}
      <BotCreationModal
        open={showBotModal}
        onClose={() => setShowBotModal(false)}
        onSuccess={(count) => {
          mutateBots();
          setShowBotModal(false);
        }}
      />
    </div>
  );
}

// ─── Topic Card with Inline Generation ──────────────────────────────────────

interface TopicCardWithGenerationProps {
  topic: TopicItem;
  botCount: number;
  isGenerating: boolean;
  result?: { generatedA: number; generatedB: number; errors: string[] };
  onGenerate: (topicId: string, countA: number, countB: number) => void;
}

function TopicCardWithGeneration({
  topic,
  botCount,
  isGenerating,
  result,
  onGenerate,
}: TopicCardWithGenerationProps) {
  const [countA, setCountA] = useState(3);
  const [countB, setCountB] = useState(3);

  const canGenerate = botCount > 0 && !isGenerating;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Topic Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <a
              href={`/topics/${topic.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold hover:underline"
            >
              {topic.title}
            </a>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {CATEGORY_LABELS[topic.category]}
              </Badge>
              <span>투표 {topic._count.votes}개</span>
              <span>의견 {topic.opinionCount}개</span>
            </div>
          </div>
        </div>

        {/* AI Status Badges */}
        <div className="flex flex-wrap gap-2">
          {/* Summary Status */}
          <LlmStatusBadge
            label={topic.hasSummary ? "요약 완료" : "요약 필요"}
            status={
              topic.hasSummary
                ? "complete"
                : topic.meetsMinimumForSummary
                ? "needed"
                : "insufficient"
            }
          />

          {/* Grounds A Status */}
          <LlmStatusBadge
            label={topic.hasGroundsA ? "논거 A 완료" : "논거 A 필요"}
            status={
              topic.hasGroundsA
                ? "complete"
                : topic.meetsMinimumForGrounds
                ? "needed"
                : "insufficient"
            }
          />

          {/* Grounds B Status */}
          <LlmStatusBadge
            label={topic.hasGroundsB ? "논거 B 완료" : "논거 B 필요"}
            status={
              topic.hasGroundsB
                ? "complete"
                : topic.meetsMinimumForGrounds
                ? "needed"
                : "insufficient"
            }
          />
        </div>

        {/* Opinion Generation Section */}
        <div className="pt-3 border-t space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>봇 의견 생성</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor={`countA-${topic.id}`} className="text-sm">
                A측:
              </Label>
              <Input
                id={`countA-${topic.id}`}
                type="number"
                min={0}
                max={20}
                value={countA}
                onChange={(e) => setCountA(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 text-center"
                disabled={!canGenerate}
              />
              <span className="text-sm text-muted-foreground">개</span>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor={`countB-${topic.id}`} className="text-sm">
                B측:
              </Label>
              <Input
                id={`countB-${topic.id}`}
                type="number"
                min={0}
                max={20}
                value={countB}
                onChange={(e) => setCountB(parseInt(e.target.value, 10) || 0)}
                className="w-16 h-8 text-center"
                disabled={!canGenerate}
              />
              <span className="text-sm text-muted-foreground">개</span>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      size="sm"
                      onClick={() => onGenerate(topic.id, countA, countB)}
                      disabled={!canGenerate}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          의견 생성
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {botCount === 0 && (
                  <TooltipContent>봇 계정을 먼저 생성하세요</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Generation Result */}
          {result && (
            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
              <p>
                A측 생성: {result.generatedA}개 / B측 생성: {result.generatedB}
                개
              </p>
              {result.errors.length > 0 && (
                <div className="text-destructive">
                  {result.errors.map((e, i) => (
                    <p key={i}>{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bot Creation Modal ──────────────────────────────────────────────────────

interface BotCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

function BotCreationModal({ open, onClose, onSuccess }: BotCreationModalProps) {
  const [count, setCount] = useState(5);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/llm/bot-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      if (!res.ok) {
        throw new Error("Failed to create bots");
      }

      onSuccess(count);
    } catch (err) {
      alert("봇 계정 생성 실패");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>봇 계정 추가</DialogTitle>
          <DialogDescription>
            생성할 봇 계정 수를 입력하세요 (1-50개)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bot-count">생성할 계정 수</Label>
            <Input
              id="bot-count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            취소
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            생성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
