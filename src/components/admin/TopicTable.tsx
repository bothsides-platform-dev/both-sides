"use client";

import { useState } from "react";
import Link from "next/link";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
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
  Eye,
  EyeOff,
  Star,
  StarOff,
  Edit,
  Trash2,
  ExternalLink,
  UserX,
  User,
  Clock,
} from "lucide-react";
import type { Category } from "@prisma/client";

interface Topic {
  id: string;
  title: string;
  category: Category;
  isHidden: boolean;
  isFeatured: boolean;
  isAnonymous?: boolean;
  scheduledAt?: string | null;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
  _count: {
    votes: number;
    opinions: number;
  };
}

interface TopicTableProps {
  topics: Topic[];
}

export function TopicTable({ topics }: TopicTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleToggleHidden = async (id: string, isHidden: boolean) => {
    setProcessingId(id);
    setProcessingAction("hide");
    try {
      await fetch(`/api/admin/topics/${id}/hide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !isHidden }),
      });
      mutate((key: string) => key.startsWith("/api/admin/topics"));
    } catch (error) {
      console.error("Failed to toggle hidden:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    setProcessingId(id);
    setProcessingAction("feature");
    try {
      await fetch(`/api/admin/topics/${id}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      mutate((key: string) => key.startsWith("/api/admin/topics"));
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleToggleAnonymity = async (id: string, isAnonymous: boolean) => {
    setProcessingId(id);
    setProcessingAction("anonymity");
    try {
      await fetch(`/api/admin/topics/${id}/anonymity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: !isAnonymous }),
      });
      mutate((key: string) => key.startsWith("/api/admin/topics"));
    } catch (error) {
      console.error("Failed to toggle anonymity:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteDialogOpen(false);
    setProcessingId(deleteTargetId);
    setProcessingAction("delete");
    try {
      await fetch(`/api/admin/topics/${deleteTargetId}`, {
        method: "DELETE",
      });
      mutate((key: string) => key.startsWith("/api/admin/topics"));
    } catch (error) {
      console.error("Failed to delete topic:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setDeleteTargetId(null);
    }
  };

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          토론이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={topic.isHidden ? "destructive" : "secondary"}>
                    {topic.isHidden ? "비공개" : "공개"}
                  </Badge>
                  {topic.isFeatured && (
                    <Badge variant="default">추천</Badge>
                  )}
                  {topic.isAnonymous && (
                    <Badge variant="outline">익명</Badge>
                  )}
                  {topic.scheduledAt && new Date(topic.scheduledAt) > new Date() && (
                    <Badge variant="outline" className="gap-1 text-blue-600 border-blue-300">
                      <Clock className="h-3 w-3" />
                      {new Date(topic.scheduledAt).toLocaleString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {CATEGORY_LABELS[topic.category]}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/topics/${topic.id}`}
                    className="font-medium hover:underline flex items-center gap-1"
                    target="_blank"
                  >
                    {topic.title}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">(새 창에서 열림)</span>
                  </Link>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    작성자: {topic.author.nickname || topic.author.name || "익명"}
                  </span>
                  <span>{topic.viewCount.toLocaleString()}회</span>
                  <span>투표 {topic._count.votes.toLocaleString()}</span>
                  <span>의견 {topic._count.opinions.toLocaleString()}</span>
                  <span suppressHydrationWarning>{formatRelativeTime(topic.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleHidden(topic.id, topic.isHidden)}
                  disabled={processingId === topic.id}
                  title={topic.isHidden ? "공개하기" : "숨기기"}
                  aria-label={topic.isHidden ? "공개하기" : "숨기기"}
                >
                  {processingId === topic.id && processingAction === "hide" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : topic.isHidden ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleFeatured(topic.id, topic.isFeatured)}
                  disabled={processingId === topic.id}
                  title={topic.isFeatured ? "추천 해제" : "추천 설정"}
                  aria-label={topic.isFeatured ? "추천 해제" : "추천 설정"}
                >
                  {processingId === topic.id && processingAction === "feature" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : topic.isFeatured ? (
                    <StarOff className="h-4 w-4" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleAnonymity(topic.id, topic.isAnonymous ?? false)}
                  disabled={processingId === topic.id}
                  title={topic.isAnonymous ? "익명 해제" : "익명 설정"}
                  aria-label={topic.isAnonymous ? "익명 해제" : "익명 설정"}
                >
                  {processingId === topic.id && processingAction === "anonymity" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : topic.isAnonymous ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  aria-label="수정"
                >
                  <Link href={`/admin/topics/${topic.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenDeleteDialog(topic.id)}
                  disabled={processingId === topic.id}
                  className="text-destructive hover:text-destructive"
                  title="삭제"
                  aria-label="삭제"
                >
                  {processingId === topic.id && processingAction === "delete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>토론 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 토론을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
