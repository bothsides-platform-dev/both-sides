"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TopicTable } from "@/components/admin/TopicTable";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@prisma/client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Topic {
  id: string;
  title: string;
  category: Category;
  isHidden: boolean;
  isFeatured: boolean;
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

interface TopicsResponse {
  data: {
    topics: Topic[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export default function AdminTopicsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({
    page: String(page),
    status,
    ...(search && { search }),
  });

  const { data, isLoading } = useSWR<TopicsResponse>(
    session?.user?.role === "ADMIN" ? `/api/admin/topics?${queryParams}` : null,
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

  const topics = data?.data.topics ?? [];
  const pagination = data?.data.pagination;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>토론 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Tabs
              value={status}
              onValueChange={(v) => {
                setStatus(v as "all" | "visible" | "hidden");
                setPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="visible">공개</TabsTrigger>
                <TabsTrigger value="hidden">비공개</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="제목 또는 설명으로 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline">
                검색
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <TopicTable topics={topics} />

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
    </div>
  );
}
