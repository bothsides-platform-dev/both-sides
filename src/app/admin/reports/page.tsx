"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { Loader2, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReportStatus } from "@prisma/client";

interface Report {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  opinion?: {
    id: string;
    body: string;
    isBlinded: boolean;
    user: {
      id: string;
      nickname?: string | null;
      name?: string | null;
    };
    topic: {
      id: string;
      title: string;
    };
  } | null;
  topic?: {
    id: string;
    title: string;
    isHidden: boolean;
    author: {
      id: string;
      nickname?: string | null;
      name?: string | null;
    };
  } | null;
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
}

type ReportTypeFilter = "ALL" | "opinion" | "topic";

const statusLabels: Record<ReportStatus, string> = {
  PENDING: "대기 중",
  REVIEWED: "처리됨",
  DISMISSED: "기각됨",
};

const statusColors: Record<ReportStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "default",
  REVIEWED: "secondary",
  DISMISSED: "destructive",
};

export default function AdminReportsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("PENDING");
  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>("ALL");
  const [processing, setProcessing] = useState<string | null>(null);

  const queryParams = new URLSearchParams();
  if (statusFilter !== "ALL") queryParams.set("status", statusFilter);
  if (typeFilter !== "ALL") queryParams.set("type", typeFilter);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data, isLoading } = useSWR<{ data: Report[] }>(
    session?.user?.role === "ADMIN" ? `/api/admin/reports${queryString}` : null,
    fetcher
  );

  if (sessionStatus === "loading" || isLoading) {
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

  const reports: Report[] = data?.data ?? [];

  const handleUpdateStatus = async (id: string, status: "REVIEWED" | "DISMISSED") => {
    setProcessing(id);
    try {
      await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      mutate(`/api/admin/reports${queryString}`);
    } catch (error) {
      console.error("Failed to update report:", error);
    } finally {
      setProcessing(null);
    }
  };

  const getReportType = (report: Report): "opinion" | "topic" => {
    return report.opinion ? "opinion" : "topic";
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>신고 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">상태별 필터</p>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | "ALL")}>
              <TabsList>
                <TabsTrigger value="ALL">전체</TabsTrigger>
                <TabsTrigger value="PENDING">대기 중</TabsTrigger>
                <TabsTrigger value="REVIEWED">처리됨</TabsTrigger>
                <TabsTrigger value="DISMISSED">기각됨</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">유형별 필터</p>
            <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as ReportTypeFilter)}>
              <TabsList>
                <TabsTrigger value="ALL">전체</TabsTrigger>
                <TabsTrigger value="opinion">의견 신고</TabsTrigger>
                <TabsTrigger value="topic">토론 신고</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            신고 내역이 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportType = getReportType(report);

            return (
              <Card key={report.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColors[report.status]}>
                          {statusLabels[report.status]}
                        </Badge>
                        <Badge variant="outline">
                          {reportType === "opinion" ? "의견" : "토론"}
                        </Badge>
                        <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                          {formatRelativeTime(report.createdAt)}
                        </span>
                      </div>
                      {reportType === "opinion" && report.opinion && (
                        <Link
                          href={`/topics/${report.opinion.topic.id}`}
                          className="flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          {report.opinion.topic.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                      {reportType === "topic" && report.topic && (
                        <Link
                          href={`/topics/${report.topic.id}`}
                          className="flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          {report.topic.title}
                          <ExternalLink className="h-3 w-3" />
                          {report.topic.isHidden && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              숨김 처리됨
                            </Badge>
                          )}
                        </Link>
                      )}
                    </div>
                    {report.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                          disabled={processing === report.id}
                        >
                          {processing === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          기각
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(report.id, "REVIEWED")}
                          disabled={processing === report.id}
                        >
                          {processing === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {reportType === "opinion" ? "블라인드" : "숨김 처리"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {reportType === "opinion" && report.opinion && (
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                      <div className="text-xs text-muted-foreground">
                        신고된 의견 (by {report.opinion.user ? (report.opinion.user.nickname || report.opinion.user.name || "익명") : "손님"})
                      </div>
                      <p className="text-sm">
                        {report.opinion.isBlinded ? (
                          <span className="text-muted-foreground italic">
                            [블라인드 처리됨]
                          </span>
                        ) : (
                          report.opinion.body
                        )}
                      </p>
                    </div>
                  )}

                  {reportType === "topic" && report.topic && (
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                      <div className="text-xs text-muted-foreground">
                        신고된 토론 (by {report.topic.author.nickname || report.topic.author.name || "익명"})
                      </div>
                      <p className="text-sm font-medium">
                        {report.topic.isHidden ? (
                          <span className="text-muted-foreground italic">
                            [숨김 처리됨] {report.topic.title}
                          </span>
                        ) : (
                          report.topic.title
                        )}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      신고 사유 (by {report.user.nickname || report.user.name || "익명"})
                    </div>
                    <p className="text-sm">{report.reason}</p>
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
