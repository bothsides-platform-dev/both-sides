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
import { Loader2, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReportStatus } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Report {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  opinion: {
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
  };
  user: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
}

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
  const [processing, setProcessing] = useState<string | null>(null);

  const queryStatus = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
  const { data, isLoading } = useSWR(
    session?.user?.role === "ADMIN" ? `/api/admin/reports${queryStatus}` : null,
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
      mutate(`/api/admin/reports${queryStatus}`);
    } catch (error) {
      console.error("Failed to update report:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>신고 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | "ALL")}>
            <TabsList>
              <TabsTrigger value="ALL">전체</TabsTrigger>
              <TabsTrigger value="PENDING">대기 중</TabsTrigger>
              <TabsTrigger value="REVIEWED">처리됨</TabsTrigger>
              <TabsTrigger value="DISMISSED">기각됨</TabsTrigger>
            </TabsList>
          </Tabs>
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
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[report.status]}>
                        {statusLabels[report.status]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(report.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={`/topics/${report.opinion.topic.id}`}
                      className="flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {report.opinion.topic.title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
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
                        블라인드
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    신고된 의견 (by {report.opinion.user.nickname || report.opinion.user.name || "익명"})
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

                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    신고 사유 (by {report.user.nickname || report.user.name || "익명"})
                  </div>
                  <p className="text-sm">{report.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
