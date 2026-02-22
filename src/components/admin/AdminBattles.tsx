"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  OctagonX,
  MessageSquare,
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { formatRelativeTime } from "@/lib/utils";
import type { BattleStatus } from "@prisma/client";

interface Battle {
  id: string;
  status: BattleStatus;
  isHidden: boolean;
  challengerSide: string;
  challengedSide: string;
  challengerHp: number | null;
  challengedHp: number | null;
  durationSeconds: number | null;
  endReason: string | null;
  challengedAt: string;
  topic: {
    id: string;
    title: string;
    optionA: string;
    optionB: string;
  };
  challenger: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
  challenged: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
  winner?: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  } | null;
  _count: {
    messages: number;
    comments: number;
  };
}

interface BattlesResponse {
  data: {
    battles: Battle[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface StatsResponse {
  data: {
    total: number;
    active: number;
    pending: number;
    completed: number;
    hidden: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "대기",
  SETUP: "설정",
  ACTIVE: "진행중",
  COMPLETED: "완료",
  RESIGNED: "기권",
  ABANDONED: "이탈",
  DECLINED: "거절",
  EXPIRED: "만료",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  SETUP: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  RESIGNED: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  ABANDONED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  DECLINED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  EXPIRED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

function revalidateBattles() {
  mutate((key: unknown) => typeof key === "string" && key.startsWith("/api/admin/battles"));
}

export function AdminBattles() {
  const [status, setStatus] = useState<"all" | "active" | "completed" | "hidden">("all");
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [forceEndDialogOpen, setForceEndDialogOpen] = useState(false);
  const [forceEndTargetId, setForceEndTargetId] = useState<string | null>(null);
  const [forceEndReason, setForceEndReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const queryParams = new URLSearchParams({
    page: String(page),
    status,
    ...(submittedSearch && { search: submittedSearch }),
  });

  const { data, isLoading } = useSWR<BattlesResponse>(
    `/api/admin/battles?${queryParams}`,
    fetcher
  );

  const { data: statsData } = useSWR<StatsResponse>(
    "/api/admin/battles?stats=true",
    fetcher
  );

  const battles = data?.data.battles ?? [];
  const pagination = data?.data.pagination;
  const stats = statsData?.data;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedSearch(searchInput);
    setPage(1);
  };

  const handleToggleHidden = async (id: string, isHidden: boolean) => {
    setProcessingId(id);
    setProcessingAction("hide");
    try {
      await fetch(`/api/admin/battles/${id}/hide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !isHidden }),
      });
      revalidateBattles();
    } catch (error) {
      console.error("Failed to toggle hidden:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleForceEnd = async () => {
    if (!forceEndTargetId) return;
    setForceEndDialogOpen(false);
    setProcessingId(forceEndTargetId);
    setProcessingAction("forceEnd");
    try {
      await fetch(`/api/admin/battles/${forceEndTargetId}/force-end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: forceEndReason || undefined }),
      });
      revalidateBattles();
    } catch (error) {
      console.error("Failed to force-end battle:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setForceEndTargetId(null);
      setForceEndReason("");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteDialogOpen(false);
    setProcessingId(deleteTargetId);
    setProcessingAction("delete");
    try {
      await fetch(`/api/admin/battles/${deleteTargetId}`, {
        method: "DELETE",
      });
      revalidateBattles();
    } catch (error) {
      console.error("Failed to delete battle:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>맞짱 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">전체</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">대기</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="text-lg font-bold text-green-600">{stats.active}</div>
                <div className="text-xs text-muted-foreground">진행중</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="text-lg font-bold text-blue-600">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">완료</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div className="text-lg font-bold text-red-600">{stats.hidden}</div>
                <div className="text-xs text-muted-foreground">숨김</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Tabs
              value={status}
              onValueChange={(v) => {
                setStatus(v as "all" | "active" | "completed" | "hidden");
                setPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="active">진행중</TabsTrigger>
                <TabsTrigger value="completed">완료</TabsTrigger>
                <TabsTrigger value="hidden">숨김</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="토론 제목 또는 참가자 이름 검색"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline">
                검색
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Battle List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : battles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            맞짱이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {battles.map((battle) => {
            const challengerName = battle.challenger.nickname || battle.challenger.name || "도전자";
            const challengedName = battle.challenged.nickname || battle.challenged.name || "상대";
            const isActiveBattle = ["PENDING", "SETUP", "ACTIVE"].includes(battle.status);

            return (
              <Card key={battle.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Status badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[battle.status] || ""}`}>
                          {STATUS_LABELS[battle.status] || battle.status}
                        </span>
                        {battle.isHidden && (
                          <Badge variant="destructive">숨김</Badge>
                        )}
                        {battle.endReason === "admin_force_ended" && (
                          <Badge variant="outline" className="text-red-600 border-red-300">관리자 종료</Badge>
                        )}
                      </div>

                      {/* Topic link */}
                      <Link
                        href={`/topics/${battle.topic.id}`}
                        className="font-medium hover:underline flex items-center gap-1 text-sm"
                        target="_blank"
                      >
                        {battle.topic.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      {/* Participants */}
                      <div className="text-sm">
                        <span className="font-medium">{challengerName}</span>
                        <span className="text-muted-foreground mx-2">vs</span>
                        <span className="font-medium">{challengedName}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {battle.challengerHp !== null && battle.challengedHp !== null && (
                          <span>
                            HP: {battle.challengerHp} / {battle.challengedHp}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {battle._count.messages}
                        </span>
                        <span suppressHydrationWarning>
                          {formatRelativeTime(battle.challengedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleHidden(battle.id, battle.isHidden)}
                        disabled={processingId === battle.id}
                        title={battle.isHidden ? "공개하기" : "숨기기"}
                      >
                        {processingId === battle.id && processingAction === "hide" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : battle.isHidden ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>

                      {isActiveBattle && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setForceEndTargetId(battle.id);
                            setForceEndDialogOpen(true);
                          }}
                          disabled={processingId === battle.id}
                          title="강제 종료"
                          className="text-orange-600 hover:text-orange-600"
                        >
                          {processingId === battle.id && processingAction === "forceEnd" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <OctagonX className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDeleteTargetId(battle.id);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={processingId === battle.id}
                        className="text-destructive hover:text-destructive"
                        title="삭제"
                      >
                        {processingId === battle.id && processingAction === "delete" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        title="상세 보기"
                      >
                        <Link href={`/battles/${battle.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pagination.totalPages} 페이지 (총 {pagination.total}개)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Force-End Dialog */}
      <Dialog open={forceEndDialogOpen} onOpenChange={setForceEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>맞짱 강제 종료</DialogTitle>
            <DialogDescription>
              이 맞짱을 강제 종료합니다. 승자 없이 종료되며, 참가자에게 알림이 전송됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="종료 사유 (선택)"
            value={forceEndReason}
            onChange={(e) => setForceEndReason(e.target.value)}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceEndDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleForceEnd}>
              강제 종료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>맞짱 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 맞짱을 삭제하시겠습니까? 관련된 메시지, 댓글, 알림이 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
