"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import {
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
} from "@/lib/constants";
import {
  Loader2,
  Clock,
  CheckCircle,
  CheckCheck,
  Bug,
  Lightbulb,
  HelpCircle,
  MoreHorizontal,
  Mail,
  User,
} from "lucide-react";
import type { FeedbackStatus, FeedbackCategory } from "@prisma/client";

interface Feedback {
  id: string;
  category: FeedbackCategory;
  content: string;
  email: string | null;
  status: FeedbackStatus;
  adminNote: string | null;
  createdAt: string;
  user: {
    id: string;
    nickname: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface FeedbackStats {
  pending: number;
  reviewed: number;
  resolved: number;
  total: number;
}

const categoryIcons: Record<FeedbackCategory, typeof Bug> = {
  BUG: Bug,
  SUGGESTION: Lightbulb,
  QUESTION: HelpCircle,
  OTHER: MoreHorizontal,
};

const statusIcons: Record<FeedbackStatus, typeof Clock> = {
  PENDING: Clock,
  REVIEWED: CheckCircle,
  RESOLVED: CheckCheck,
};

const statusColors: Record<FeedbackStatus, "default" | "secondary" | "outline"> = {
  PENDING: "default",
  REVIEWED: "secondary",
  RESOLVED: "outline",
};

export default function AdminFeedbackPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "ALL">("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const queryStatus = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;

  const { data: feedbackData, isLoading: feedbackLoading } = useSWR<{
    data: { feedbacks: Feedback[]; pagination: { total: number } };
  }>(
    session?.user?.role === "ADMIN" ? `/api/admin/feedback${queryStatus}` : null,
    fetcher
  );

  const { data: statsData } = useSWR<{ data: FeedbackStats }>(
    session?.user?.role === "ADMIN" ? `/api/admin/feedback/stats` : null,
    fetcher
  );

  if (sessionStatus === "loading" || feedbackLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const feedbacks = feedbackData?.data?.feedbacks ?? [];
  const stats = statsData?.data;

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus) => {
    setProcessing(id);
    try {
      await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      mutate(`/api/admin/feedback${queryStatus}`);
      mutate("/api/admin/feedback/stats");
    } catch (error) {
      console.error("Failed to update feedback:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveNote = async (id: string) => {
    setProcessing(id);
    try {
      await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminNote: noteContent }),
      });
      mutate(`/api/admin/feedback${queryStatus}`);
      setEditingNote(null);
      setNoteContent("");
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setProcessing(null);
    }
  };

  const startEditNote = (feedback: Feedback) => {
    setEditingNote(feedback.id);
    setNoteContent(feedback.adminNote || "");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">전체</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground">대기 중</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.reviewed}
              </div>
              <div className="text-sm text-muted-foreground">검토 완료</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
              <div className="text-sm text-muted-foreground">해결 완료</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>피드백 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as FeedbackStatus | "ALL")}
          >
            <TabsList>
              <TabsTrigger value="ALL">전체</TabsTrigger>
              <TabsTrigger value="PENDING">대기 중</TabsTrigger>
              <TabsTrigger value="REVIEWED">검토 완료</TabsTrigger>
              <TabsTrigger value="RESOLVED">해결 완료</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {feedbacks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            피드백이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => {
            const CategoryIcon = categoryIcons[feedback.category];
            const StatusIcon = statusIcons[feedback.status];

            return (
              <Card key={feedback.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CategoryIcon className="h-3 w-3" />
                          {FEEDBACK_CATEGORY_LABELS[feedback.category]}
                        </Badge>
                        <Badge
                          variant={statusColors[feedback.status]}
                          className="gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {FEEDBACK_STATUS_LABELS[feedback.status]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(feedback.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {feedback.user ? (
                          <>
                            <User className="h-3 w-3" />
                            <span>
                              {feedback.user.nickname ||
                                feedback.user.name ||
                                feedback.user.email}
                            </span>
                          </>
                        ) : feedback.email ? (
                          <>
                            <Mail className="h-3 w-3" />
                            <span>{feedback.email}</span>
                          </>
                        ) : (
                          <span className="italic">익명</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {feedback.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(feedback.id, "REVIEWED")
                          }
                          disabled={processing === feedback.id}
                        >
                          {processing === feedback.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "검토 완료"
                          )}
                        </Button>
                      )}
                      {feedback.status !== "RESOLVED" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleUpdateStatus(feedback.id, "RESOLVED")
                          }
                          disabled={processing === feedback.id}
                        >
                          {processing === feedback.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "해결 완료"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {feedback.content}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">관리자 메모</span>
                      {editingNote !== feedback.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditNote(feedback)}
                        >
                          {feedback.adminNote ? "수정" : "추가"}
                        </Button>
                      )}
                    </div>

                    {editingNote === feedback.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="메모를 입력하세요"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNote(null);
                              setNoteContent("");
                            }}
                          >
                            취소
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveNote(feedback.id)}
                            disabled={processing === feedback.id}
                          >
                            {processing === feedback.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "저장"
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : feedback.adminNote ? (
                      <div className="rounded-lg border bg-background p-3">
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {feedback.adminNote}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        메모 없음
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
