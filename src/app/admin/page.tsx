"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { StatsCard } from "@/components/admin/StatsCard";
import { Loader2, MessageSquare, Users, Vote, MessageCircle, Star, EyeOff, Flag } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Stats {
  totalTopics: number;
  hiddenTopics: number;
  visibleTopics: number;
  featuredTopics: number;
  totalVotes: number;
  totalOpinions: number;
  totalUsers: number;
  pendingReports: number;
}

export default function AdminDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const { data, isLoading } = useSWR<{ data: Stats }>(
    session?.user?.role === "ADMIN" ? "/api/admin/stats" : null,
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

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">대시보드</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="전체 토론"
          value={stats?.totalTopics ?? 0}
          icon={MessageSquare}
        />
        <StatsCard
          title="공개 토론"
          value={stats?.visibleTopics ?? 0}
          icon={MessageSquare}
          variant="success"
        />
        <StatsCard
          title="비공개 토론"
          value={stats?.hiddenTopics ?? 0}
          icon={EyeOff}
          variant="warning"
        />
        <StatsCard
          title="추천 토론"
          value={stats?.featuredTopics ?? 0}
          icon={Star}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="전체 투표"
          value={stats?.totalVotes ?? 0}
          icon={Vote}
        />
        <StatsCard
          title="전체 의견"
          value={stats?.totalOpinions ?? 0}
          icon={MessageCircle}
        />
        <StatsCard
          title="전체 사용자"
          value={stats?.totalUsers ?? 0}
          icon={Users}
        />
        <StatsCard
          title="대기 중인 신고"
          value={stats?.pendingReports ?? 0}
          icon={Flag}
          variant={stats?.pendingReports ? "warning" : "default"}
        />
      </div>
    </div>
  );
}
