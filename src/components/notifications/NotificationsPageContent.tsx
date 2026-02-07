"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { CheckCheck, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationList } from "./NotificationList";
import { fetcher } from "@/lib/fetcher";

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    nickname: string | null;
    name: string | null;
    image: string | null;
  } | null;
  opinion: {
    id: string;
    body: string;
  } | null;
  reply: {
    id: string;
    body: string;
  } | null;
  topic: {
    id: string;
    title: string;
  } | null;
}

interface NotificationsResponse {
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function NotificationsPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, mutate } = useSWR<NotificationsResponse>(
    session?.user ? `/api/notifications?page=${page}&limit=20` : null,
    fetcher
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
        mutate();
      } catch {
        // Silently fail
      }
    },
    [mutate]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      mutate();
    } catch {
      // Silently fail
    }
  }, [mutate]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/signin?callbackUrl=/notifications");
    return null;
  }

  const notifications = data?.data.notifications ?? [];
  const unreadCount = data?.data.unreadCount ?? 0;
  const totalPages = data?.data.pagination?.totalPages ?? 1;
  const hasMore = page < totalPages;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">알림</h1>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            모두 읽음
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">알림이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <NotificationList
              notifications={notifications}
              onRead={markAsRead}
            />
          </div>

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
              >
                더 보기
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
