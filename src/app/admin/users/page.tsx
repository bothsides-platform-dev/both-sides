"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserTable } from "@/components/admin/UserTable";
import { fetcher } from "@/lib/fetcher";
import { Loader2, Search } from "lucide-react";
import type { Role } from "@prisma/client";

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", "20");
  if (search) queryParams.set("search", search);
  if (roleFilter !== "all") {
    queryParams.set("role", roleFilter);
  }

  const { data, isLoading } = useSWR<{
    data: {
      users: Array<{
        id: string;
        nickname: string | null;
        name: string | null;
        email: string | null;
        role: Role;
        createdAt: string;
        _count: {
          topics: number;
          opinions: number;
          votes: number;
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
    session?.user?.role === "ADMIN" ? `/api/admin/users?${queryParams}` : null,
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

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const users = data?.data?.users ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>사용자 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="닉네임, 이름, 이메일 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </form>

            <Tabs value={roleFilter} onValueChange={handleRoleChange}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="USER">일반</TabsTrigger>
                <TabsTrigger value="ADMIN">관리자</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {pagination && (
            <div className="text-sm text-muted-foreground">
              전체 {pagination.total.toLocaleString()}명
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
        <UserTable users={users} />
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
