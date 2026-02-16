"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import { Loader2, User, MapPin } from "lucide-react";

type ScoreGroup = "detractor" | "passive" | "promoter";

interface SiteReview {
  id: string;
  score: number;
  comment: string | null;
  pathname: string | null;
  visitorId: string | null;
  createdAt: string;
  user: {
    id: string;
    nickname: string | null;
    name: string | null;
    image: string | null;
  } | null;
}

interface SiteReviewStats {
  detractors: number;
  passives: number;
  promoters: number;
  total: number;
  npsScore: number;
  avgScore: number;
}

function getScoreBadgeStyle(score: number) {
  if (score >= 9) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (score >= 7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

function getNpsColor(score: number) {
  if (score > 0) return "text-green-600";
  if (score < 0) return "text-red-600";
  return "text-yellow-600";
}

export default function AdminSiteReviewsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<ScoreGroup | "ALL">("ALL");

  const queryParam = filter === "ALL" ? "" : `?scoreGroup=${filter}`;

  const { data: reviewsData, isLoading } = useSWR<{
    data: { reviews: SiteReview[]; pagination: { total: number } };
  }>(
    session?.user?.role === "ADMIN"
      ? `/api/admin/site-reviews${queryParam}`
      : null,
    fetcher
  );

  const { data: statsData } = useSWR<{ data: SiteReviewStats }>(
    session?.user?.role === "ADMIN" ? `/api/admin/site-reviews/stats` : null,
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

  const reviews = reviewsData?.data?.reviews ?? [];
  const stats = statsData?.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">전체 응답</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className={`text-2xl font-bold ${getNpsColor(stats.npsScore)}`}>
                {stats.npsScore > 0 ? "+" : ""}
                {stats.npsScore}
              </div>
              <div className="text-sm text-muted-foreground">NPS 점수</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {stats.avgScore.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">평균 점수</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.total > 0
                  ? Math.round((stats.promoters / stats.total) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground">추천 비율</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>NPS 리뷰</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as ScoreGroup | "ALL")}
          >
            <TabsList>
              <TabsTrigger value="ALL">
                전체{stats ? ` (${stats.total})` : ""}
              </TabsTrigger>
              <TabsTrigger value="detractor">
                비추천 0-6{stats ? ` (${stats.detractors})` : ""}
              </TabsTrigger>
              <TabsTrigger value="passive">
                중립 7-8{stats ? ` (${stats.passives})` : ""}
              </TabsTrigger>
              <TabsTrigger value="promoter">
                추천 9-10{stats ? ` (${stats.promoters})` : ""}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            리뷰가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${getScoreBadgeStyle(review.score)}`}
                    >
                      {review.score}점
                    </span>
                    <span
                      className="text-sm text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(review.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {review.user ? (
                      <>
                        <User className="h-3 w-3" />
                        <span>
                          {review.user.nickname || review.user.name}
                        </span>
                      </>
                    ) : (
                      <span className="italic">익명</span>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {review.comment}
                    </p>
                  </div>
                )}

                {review.pathname && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{review.pathname}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
