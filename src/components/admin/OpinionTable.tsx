"use client";

import { useState } from "react";
import Link from "next/link";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import {
  Loader2,
  UserX,
  User,
  ExternalLink,
  Trash2,
} from "lucide-react";
import type { Side } from "@prisma/client";

interface Opinion {
  id: string;
  body: string;
  side: Side;
  isBlinded: boolean;
  isAnonymous?: boolean;
  createdAt: string;
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
  topic: {
    id: string;
    title: string;
  };
  _count: {
    reactions: number;
    reports: number;
  };
}

interface OpinionTableProps {
  opinions: Opinion[];
}

export function OpinionTable({ opinions }: OpinionTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleToggleAnonymity = async (id: string, isAnonymous: boolean) => {
    setProcessingId(id);
    setProcessingAction("anonymity");
    try {
      await fetch(`/api/admin/opinions/${id}/anonymity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAnonymous: !isAnonymous }),
      });
      mutate((key: string) => key.startsWith("/api/admin/opinions"));
    } catch (error) {
      console.error("Failed to toggle anonymity:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 의견을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }
    setProcessingId(id);
    setProcessingAction("delete");
    try {
      await fetch(`/api/admin/opinions/${id}`, {
        method: "DELETE",
      });
      mutate((key: string) => key.startsWith("/api/admin/opinions"));
    } catch (error) {
      console.error("Failed to delete opinion:", error);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  if (opinions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          의견이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {opinions.map((opinion) => (
        <Card key={opinion.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={opinion.isBlinded ? "destructive" : "secondary"}>
                    {opinion.isBlinded ? "블라인드" : "정상"}
                  </Badge>
                  {opinion.isAnonymous && (
                    <Badge variant="outline">익명</Badge>
                  )}
                  <Badge variant={opinion.side === "A" ? "sideA" : "sideB"}>
                    {opinion.side}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/topics/${opinion.topic.id}`}
                    className="text-sm font-medium hover:underline flex items-center gap-1"
                    target="_blank"
                  >
                    {opinion.topic.title}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {opinion.body}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    작성자: {opinion.user.nickname || opinion.user.name || "익명"}
                  </span>
                  <span>반응 {opinion._count.reactions}</span>
                  <span>신고 {opinion._count.reports}</span>
                  <span suppressHydrationWarning>{formatRelativeTime(opinion.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleAnonymity(opinion.id, opinion.isAnonymous ?? false)}
                  disabled={processingId === opinion.id}
                  title={opinion.isAnonymous ? "익명 해제" : "익명 설정"}
                >
                  {processingId === opinion.id && processingAction === "anonymity" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : opinion.isAnonymous ? (
                    <UserX className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(opinion.id)}
                  disabled={processingId === opinion.id}
                  className="text-destructive hover:text-destructive"
                  title="삭제"
                >
                  {processingId === opinion.id && processingAction === "delete" ? (
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
    </div>
  );
}
