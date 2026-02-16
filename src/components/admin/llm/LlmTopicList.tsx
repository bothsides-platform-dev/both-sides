"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Sparkles, Brain, Search, AlertCircle } from "lucide-react";
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

interface ApiResponse {
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

interface ActionResult {
  success: boolean;
  message: string;
}

export function LlmTopicList() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<
    "summary" | "grounds" | null
  >(null);
  const [actionResults, setActionResults] = useState<
    Record<string, ActionResult>
  >({});

  const { data, mutate } = useSWR<ApiResponse>(
    `/api/admin/llm/topics?page=${page}&limit=20&filter=${filter}&search=${search}`,
    fetcher
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSummarize = async (topicId: string) => {
    setProcessingId(topicId);
    setProcessingAction("summary");
    try {
      const res = await fetch(`/api/admin/llm/summarize/${topicId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to generate summary");
      }
      setActionResults((prev) => ({
        ...prev,
        [topicId]: { success: true, message: "요약 생성 완료" },
      }));
      mutate();
      setTimeout(() => {
        setActionResults((prev) => {
          const newResults = { ...prev };
          delete newResults[topicId];
          return newResults;
        });
      }, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "요약 생성 실패";
      setActionResults((prev) => ({
        ...prev,
        [topicId]: { success: false, message },
      }));
      setTimeout(() => {
        setActionResults((prev) => {
          const newResults = { ...prev };
          delete newResults[topicId];
          return newResults;
        });
      }, 5000);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleGrounds = async (topicId: string) => {
    setProcessingId(topicId);
    setProcessingAction("grounds");
    try {
      const res = await fetch(`/api/admin/llm/grounds/${topicId}`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to generate grounds");
      }
      setActionResults((prev) => ({
        ...prev,
        [topicId]: { success: true, message: "논거 생성 완료" },
      }));
      mutate();
      setTimeout(() => {
        setActionResults((prev) => {
          const newResults = { ...prev };
          delete newResults[topicId];
          return newResults;
        });
      }, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "논거 생성 실패";
      setActionResults((prev) => ({
        ...prev,
        [topicId]: { success: false, message },
      }));
      setTimeout(() => {
        setActionResults((prev) => {
          const newResults = { ...prev };
          delete newResults[topicId];
          return newResults;
        });
      }, 5000);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const filterTabs: { value: FilterType; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "needs_summary", label: "요약 필요" },
    { value: "needs_grounds", label: "논거 필요" },
    { value: "complete", label: "AI 완료" },
  ];

  return (
    <div className="space-y-4">
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

      {/* Topics List */}
      {!data ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data.data.topics.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          조건에 맞는 토론이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.topics.map((topic) => {
            const isProcessing = processingId === topic.id;
            const result = actionResults[topic.id];

            return (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
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
                        label={
                          topic.hasGroundsA ? "논거 A 완료" : "논거 A 필요"
                        }
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
                        label={
                          topic.hasGroundsB ? "논거 B 완료" : "논거 B 필요"
                        }
                        status={
                          topic.hasGroundsB
                            ? "complete"
                            : topic.meetsMinimumForGrounds
                              ? "needed"
                              : "insufficient"
                        }
                      />

                      {/* Insufficient Opinions Badge */}
                      {(!topic.meetsMinimumForSummary ||
                        !topic.meetsMinimumForGrounds) && (
                        <Badge
                          variant="secondary"
                          className="bg-gray-400 text-white"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          의견 부족 (현재: {topic.opinionCount}개)
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSummarize(topic.id)}
                                disabled={
                                  !topic.meetsMinimumForSummary ||
                                  isProcessing
                                }
                              >
                                {isProcessing &&
                                processingAction === "summary" ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                요약 생성
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!topic.meetsMinimumForSummary && (
                            <TooltipContent>
                              요약 생성은 의견 3개 이상 필요합니다 (현재:{" "}
                              {topic.opinionCount}개)
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGrounds(topic.id)}
                                disabled={
                                  !topic.meetsMinimumForGrounds || isProcessing
                                }
                              >
                                {isProcessing &&
                                processingAction === "grounds" ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Brain className="h-4 w-4 mr-2" />
                                )}
                                논거 생성
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {!topic.meetsMinimumForGrounds && (
                            <TooltipContent>
                              논거 생성은 의견 10개 이상 필요합니다 (현재:{" "}
                              {topic.opinionCount}개)
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Result Message */}
                    {result && (
                      <div
                        className={`rounded-md p-3 text-sm ${
                          result.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.message}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {data.data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(data.data.pagination.totalPages, p + 1))
            }
            disabled={page === data.data.pagination.totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
