"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpinionTable } from "@/components/admin/OpinionTable";
import { fetcher } from "@/lib/fetcher";
import { Loader2, Search } from "lucide-react";

export default function AdminOpinionsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isBlinded, setIsBlinded] = useState<string>("all");

  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", "20");
  if (search) queryParams.set("search", search);
  if (isBlinded !== "all") {
    queryParams.set("isBlinded", isBlinded === "blinded" ? "true" : "false");
  }

  const { data, isLoading } = useSWR<{
    data: {
      opinions: Array<{
        id: string;
        body: string;
        side: "A" | "B";
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
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }>(
    session?.user?.role === "ADMIN" ? `/api/admin/opinions?${queryParams}` : null,
    fetcher
  );

  if (status === "loading") {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setIsBlinded(value);
    setPage(1);
  };

  const opinions = data?.data?.opinions ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>의견 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="의견 내용, 작성자 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </form>

            <Tabs value={isBlinded} onValueChange={handleStatusChange}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="normal">정상</TabsTrigger>
                <TabsTrigger value="blinded">블라인드</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {pagination && (
            <div className="text-sm text-muted-foreground">
              전체 {pagination.total.toLocaleString()}개
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <OpinionTable opinions={opinions} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm">
              {page} / {pagination.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
